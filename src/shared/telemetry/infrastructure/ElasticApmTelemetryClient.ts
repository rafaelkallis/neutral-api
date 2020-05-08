import apm from 'elastic-apm-node';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  HttpTelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';
import { User } from 'user/domain/User';
import { Environment } from 'shared/utility/application/Environment';

/**
 * Elastic Apm Telemetry Client
 */
@Injectable()
export class ElasticApmTelemetryClient extends TelemetryClient {
  private readonly environment: Environment;

  public constructor(environment: Environment) {
    super();
    this.environment = environment;
  }

  public onModuleInit(): void {
    if (!apm.isStarted() && !this.environment.isTest()) {
      // TODO remove test condition
      throw new Error('Elastic apm not started');
    }
  }

  protected doStartHttpTransaction(
    transactionName: string,
    transactionId: string,
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction {
    return new ElasticApmHttpTelemetryTransaction(
      transactionName,
      transactionId,
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
    transactionId: string,
    request: Request,
    response: Response,
    user: User | undefined,
    apm: any,
  ) {
    super(transactionName, transactionId, request, response, user);
    this.apmTransaction = apm.startTransaction(transactionName);
    if (user) {
      this.apmTransaction.setUserContext({ id: user.id.value });
    }
  }

  public startAction(actionName: string): TelemetryAction {
    return new ElasticApmTelemetryAction(
      this.transactionName,
      this.transactionId,
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
    transactionId: string,
    actionName: string,
    apmTransaction: any,
  ) {
    super(transactionName, transactionId, actionName);
    this.span = apmTransaction.startSpan(actionName);
  }

  protected doEnd(): void {
    this.span.end(this.actionEnd);
  }
}
