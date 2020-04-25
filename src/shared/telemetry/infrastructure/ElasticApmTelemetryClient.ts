import apm from 'elastic-apm-node';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  HttpTelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';
import { User } from 'user/domain/User';
import { Config } from 'shared/config/application/Config';

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

  protected doCreateHttpTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction {
    return new ElasticApmHttpTelemetryTransaction(
      this.computeHttpTransactionName(request),
      request,
      response,
      user,
      apm,
    );
  }
}

class ElasticApmHttpTelemetryTransaction extends HttpTelemetryTransaction {
  private readonly apmTransaction: any;

  public constructor(
    transactionName: string,
    request: Request,
    response: Response,
    user: User | undefined,
    apm: any,
  ) {
    super(transactionName, request, response, user);
    this.apmTransaction = apm.startTransaction(transactionName);
    if (user) {
      this.apmTransaction.setUserContext({ id: user.id.value });
    }
  }

  public createAction(actionName: string): TelemetryAction {
    return new ElasticApmTelemetryAction(
      this.transactionName,
      actionName,
      this.apmTransaction,
    );
  }

  protected doEnd(error?: Error): void {
    if (error) {
      this.apmTransaction.captureError(error);
    }
  }
}

class ElasticApmTelemetryAction extends TelemetryAction {
  private readonly span: any;

  public constructor(
    transactionName: string,
    actionName: string,
    apmTransaction: any,
  ) {
    super(transactionName, actionName);
    this.span = apmTransaction.startSpan(actionName);
  }

  protected doEnd(): void {
    this.span.end(this.actionEnd);
  }
}
