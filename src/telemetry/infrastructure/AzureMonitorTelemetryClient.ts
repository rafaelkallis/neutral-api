import * as appInsights from 'applicationinsights';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
} from 'telemetry/application/TelemetryClient';
import { Config } from 'config/application/Config';

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

class AzureMonitorTelemetryAction implements TelemetryAction {
  private readonly client: appInsights.TelemetryClient;
  private readonly name: string;
  private readonly start: number;

  public constructor(client: appInsights.TelemetryClient, name: string) {
    this.client = client;
    this.name = name;
    this.start = Date.now();
  }

  end(): void {
    const end = Date.now();
    const duration = end - this.start;
    this.client.trackEvent({ name: this.name, measurements: { duration } });
  }
}
