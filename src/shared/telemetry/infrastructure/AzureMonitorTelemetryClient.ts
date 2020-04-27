import * as appInsights from 'applicationinsights';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  HttpTelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';
import { Config } from 'shared/config/application/Config';
import { User } from 'user/domain/User';
import { PerformanceMeasurer } from 'shared/telemetry/application/PerformanceMeasurer';

/**
 * Azure Monitor Telemetry Client
 */
@Injectable()
export class AzureMonitorTelemetryClient extends TelemetryClient
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  private readonly logger: Logger;
  private readonly client: appInsights.TelemetryClient;
  private readonly performanceMeasurer: PerformanceMeasurer;
  private trackPerformanceTimeout: NodeJS.Timeout;

  public constructor(config: Config, performanceMeasurer: PerformanceMeasurer) {
    super();
    this.logger = new Logger(AzureMonitorTelemetryClient.name);
    const instrumentationKey = config.get('AZURE_MONITOR_INSTRUMENTATION_KEY');
    this.client = new appInsights.TelemetryClient(instrumentationKey);
    this.performanceMeasurer = performanceMeasurer;
    this.trackPerformanceTimeout = setTimeout(() => {}, 0);
  }

  public onModuleInit(): void {
    const trackPerformancePeriod = 1000;
    this.trackPerformanceTimeout = setInterval(
      () => this.trackPerformance(),
      trackPerformancePeriod,
    );
    this.logger.log('Performance tracking started');
  }

  public onModuleDestroy(): void {
    clearInterval(this.trackPerformanceTimeout);
    this.trackPerformanceTimeout = setTimeout(() => {}, 0);
    this.logger.log('Performance tracking stopped');
  }

  public async onApplicationShutdown(): Promise<void> {
    await new Promise((resolve) =>
      this.client.flush({
        callback: () => {
          resolve();
          this.logger.log('Client flushed');
        },
      }),
    );
  }

  protected doStartHttpTransaction(
    transactionName: string,
    transactionId: string,
    request: Request,
    response: Response,
    user: User | undefined,
  ): HttpTelemetryTransaction {
    return new AzureMonitorHttpTelemetryTransaction(
      transactionName,
      transactionId,
      request,
      response,
      user,
      this.client,
    );
  }

  private trackPerformance(): void {
    const memoryMetrics = this.performanceMeasurer.measureMemory();
    this.client.trackMetric({
      name: AzureMonitorPerformanceMetrics.PRIVATE_BYTES,
      value: memoryMetrics.usedMemoryBytes,
    });
    this.client.trackMetric({
      name: AzureMonitorPerformanceMetrics.AVAILABLE_BYTES,
      value: memoryMetrics.availableMemoryBytes,
    });
  }
}

class AzureMonitorHttpTelemetryTransaction extends HttpTelemetryTransaction {
  private readonly client: appInsights.TelemetryClient;

  public constructor(
    transactionName: string,
    transactionId: string,
    request: Request,
    response: Response,
    user: User | undefined,
    client: appInsights.TelemetryClient,
  ) {
    super(transactionName, transactionId, request, response, user);
    this.client = client;
  }

  public startAction(actionName: string): TelemetryAction {
    return new AzureMonitorTelemetryAction(
      this.transactionName,
      this.transactionId,
      actionName,
      this.client,
    );
  }

  protected doEnd(error?: Error): void {
    if (error) {
      this.client.trackException({ exception: error });
    }
    this.client.trackRequest({
      name: this.transactionName,
      url: this.request.route.path,
      duration: this.transactionDuration,
      success: !error,
      resultCode: this.response.statusCode,
      time: new Date(this.transactionEnd),
      tagOverrides: {
        [AzureMonitorContextTags.OPERATION_ID]: this.transactionId,
        [AzureMonitorContextTags.OPERATION_NAME]: this.transactionName,
      },
    });
  }
}

class AzureMonitorTelemetryAction extends TelemetryAction {
  private readonly client: appInsights.TelemetryClient;

  public constructor(
    transactionName: string,
    transactionId: string,
    actionName: string,
    client: appInsights.TelemetryClient,
  ) {
    super(transactionName, transactionId, actionName);
    this.client = client;
  }

  protected doEnd(): void {
    this.client.trackEvent({
      name: this.actionName,
      measurements: { duration: this.actionDuration },
      time: new Date(this.actionEnd),
      tagOverrides: {
        [AzureMonitorContextTags.OPERATION_ID]: this.transactionId,
        [AzureMonitorContextTags.OPERATION_NAME]: this.transactionName,
      },
    });
  }
}

// @see https://github.com/microsoft/ApplicationInsights-node.js/blob/48c09992de1e9848db8d3b4140322db0dfbadb49/Schema/PublicSchema/ContextTagKeys.bond
enum AzureMonitorContextTags {
  APPLICATION_VERSION = 'ai.application.ver',
  DEVICE_ID = 'ai.device.id',
  LOCATION_IP = 'ai.location.ip',
  OPERATION_ID = 'ai.operation.id',
  OPERATION_NAME = 'ai.operation.name',
  OPERATION_PARENT_ID = 'ai.operation.parentId',
  USER_ID = 'ai.user.id',
}

// @see https://github.com/microsoft/ApplicationInsights-node.js/blob/48c09992de1e9848db8d3b4140322db0dfbadb49/Declarations/Constants.ts#L28-L40
enum AzureMonitorPerformanceMetrics {
  // Memory
  PRIVATE_BYTES = '\\Process(??APP_WIN32_PROC??)\\Private Bytes',
  AVAILABLE_BYTES = '\\Memory\\Available Bytes',

  // CPU
  PROCESSOR_TIME = '\\Processor(_Total)\\% Processor Time',
  PROCESS_TIME = '\\Process(??APP_WIN32_PROC??)\\% Processor Time',
}
