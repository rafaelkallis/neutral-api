import * as appInsights from 'applicationinsights';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  TelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';
import { Config } from 'shared/config/application/Config';

/**
 * Azure Monitor Telemetry Client
 */
@Injectable()
export class AzureMonitorTelemetryClient extends TelemetryClient
  implements OnApplicationShutdown {
  private readonly client: appInsights.TelemetryClient;

  public constructor(config: Config) {
    super();
    // this.client = client;
    const instrumentationKey = config.get('AZURE_MONITOR_INSTRUMENTATION_KEY');
    this.client = new appInsights.TelemetryClient(instrumentationKey);
  }

  public async onApplicationShutdown(): Promise<void> {
    await new Promise((resolve) =>
      this.client.flush({ callback: () => resolve() }),
    );
  }

  public setTransaction(request: Request, response: Response): void {
    this.client.trackNodeHttpRequest({ request, response });
  }

  public createAction(name: string): TelemetryAction {
    return new AzureMonitorTelemetryAction(this.client, name);
  }

  public error(exception: Error): void {
    this.client.trackException({ exception });
  }
}

class AzureMonitorHttpTelemetryTransaction extends TelemetryTransaction {
  private readonly client: appInsights.TelemetryClient;
  private readonly request: Request;
  private readonly response: Response;

  public constructor(
    client: appInsights.TelemetryClient,
    request: Request,
    response: Response,
  ) {
    super(transactionName);
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
    this.client.trackRequest({});
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
