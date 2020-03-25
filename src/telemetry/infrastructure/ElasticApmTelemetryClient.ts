import apm from 'elastic-apm-node';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
} from 'telemetry/application/TelemetryClient';
import { User } from 'user/domain/User';
import { Config } from 'config/application/Config';

/**
 * Elastic Apm Telemetry Client
 */
@Injectable()
export class ElasticApmTelemetryClient extends TelemetryClient {
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.config = config;
  }

  public onModuleInit(): void {
    if (!apm.isStarted() && !this.config.isTest()) {
      throw new Error('Elastic apm not started');
    }
  }

  public setTransaction(
    _request: Request,
    _response: Response,
    authUser?: User,
  ): void {
    apm.startTransaction();
    if (authUser) {
      apm.setUserContext({ id: authUser.id.value });
    }
  }

  public createAction(name: string): TelemetryAction {
    const span = apm.startSpan(name);
    return new ElasticApmTelemetryAction(span);
  }

  public error(error: Error): void {
    apm.captureError(error);
  }
}

class ElasticApmTelemetryAction implements TelemetryAction {
  private readonly span: any;

  public constructor(span: any) {
    this.span = span;
  }

  end(): void {
    this.span.end();
  }
}
