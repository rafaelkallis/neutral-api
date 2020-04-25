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

  protected doCreateHttpTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction {
    return new AzureMonitorHttpTelemetryTransaction(
      this.computeHttpTransactionName(request),
      request,
      response,
      this.client,
    );
  }
}

class AzureMonitorHttpTelemetryTransaction extends HttpTelemetryTransaction {
  private readonly client: appInsights.TelemetryClient;

  public constructor(
    transactionName: string,
    request: Request,
    response: Response,
    client: appInsights.TelemetryClient,
  ) {
    super(transactionName, request, response);
    this.client = client;
  }

  public createAction(actionName: string): TelemetryAction {
    return new AzureMonitorTelemetryAction(
      this.client,
      this.transactionName,
      actionName,
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
      success: Boolean(error),
      resultCode: this.response.statusCode,
    });
  }
}

class AzureMonitorTelemetryAction extends TelemetryAction {
  private readonly client: appInsights.TelemetryClient;

  public constructor(
    client: appInsights.TelemetryClient,
    transactionName: string,
    actionName: string,
  ) {
    super(transactionName, actionName);
    this.client = client;
  }

  protected doEnd(error?: Error): void {
    this.client.trackEvent({
      name: this.actionName,
      measurements: { duration: this.actionDuration },
      time: new Date(this.actionEnd),
    });
  }
}
