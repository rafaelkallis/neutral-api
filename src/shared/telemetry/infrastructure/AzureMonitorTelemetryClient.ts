import * as appInsights from 'applicationinsights';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  HttpTelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';
import { Config } from 'shared/config/application/Config';
import { User } from 'user/domain/User';

/**
 * Azure Monitor Telemetry Client
 */
@Injectable()
export class AzureMonitorTelemetryClient extends TelemetryClient
  implements OnApplicationShutdown {
  private readonly client: appInsights.TelemetryClient;

  public constructor(config: Config) {
    super();
    const instrumentationKey = config.get('AZURE_MONITOR_INSTRUMENTATION_KEY');
    this.client = new appInsights.TelemetryClient(instrumentationKey);
  }

  public async onApplicationShutdown(): Promise<void> {
    await new Promise((resolve) =>
      this.client.flush({ callback: () => resolve() }),
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
export enum AzureMonitorContextTags {
  APPLICATION_VERSION = 'ai.application.ver',
  DEVICE_ID = 'ai.device.id',
  LOCATION_IP = 'ai.location.ip',
  OPERATION_ID = 'ai.operation.id',
  OPERATION_NAME = 'ai.operation.name',
  OPERATION_PARENT_ID = 'ai.operation.parentId',
  USER_ID = 'ai.user.id',
}
