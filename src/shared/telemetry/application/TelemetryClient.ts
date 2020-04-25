import { Request, Response } from 'express';
import { User } from 'user/domain/User';
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Telemetry Client.
 */
export abstract class TelemetryClient {
  private currentTransaction: TelemetryTransaction | null;

  public constructor() {
    this.currentTransaction = null;
  }

  public createHttpTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction {
    const httpTransaction = this.doCreateHttpTransaction(
      request,
      response,
      user,
    );
    this.currentTransaction = httpTransaction;
    return httpTransaction;
  }

  public getCurrentTransaction(): TelemetryTransaction {
    if (!this.currentTransaction) {
      throw new InternalServerErrorException('no active telemetry transaction');
    }
    return this.currentTransaction;
  }

  protected abstract doCreateHttpTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction;

  protected computeHttpTransactionName(request: Request): string {
    return `${request.method} ${request.route.path}`;
  }
}

export abstract class TelemetryTransaction {
  protected readonly transactionName: string;
  protected transactionStart: number;
  protected transactionEnd: number;
  protected transactionDuration: number;

  public constructor(transactionName: string) {
    this.transactionName = transactionName;
    this.transactionStart = -1;
    this.transactionEnd = -1;
    this.transactionDuration = -1;
  }

  public start(): void {
    this.transactionStart = Date.now();
  }

  public abstract createAction(actionName: string): TelemetryAction;

  public end(error?: Error): void {
    this.transactionEnd = Date.now();
    this.transactionDuration = this.transactionEnd - this.transactionStart;
    this.doEnd(error);
  }

  protected abstract doEnd(error?: Error): void;
}

export abstract class HttpTelemetryTransaction extends TelemetryTransaction {
  protected readonly request: Request;
  protected readonly response: Response;
  protected readonly user?: User;

  public constructor(
    transactionName: string,
    request: Request,
    response: Response,
    user?: User,
  ) {
    super(transactionName);
    this.request = request;
    this.response = response;
    this.user = user;
  }
}

export abstract class TelemetryAction {
  protected readonly transactionName: string;
  protected readonly actionName: string;
  protected actionStart: number;
  protected actionEnd: number;
  protected actionDuration: number;

  public constructor(transactionName: string, actionName: string) {
    this.transactionName = transactionName;
    this.actionName = actionName;
    this.actionStart = -1;
    this.actionEnd = -1;
    this.actionDuration = -1;
  }

  public start(): void {
    this.actionStart = Date.now();
  }

  public end(error?: Error): void {
    this.actionEnd = Date.now();
    this.actionDuration = this.actionEnd - this.actionStart;
    this.doEnd(error);
  }

  protected abstract doEnd(error?: Error): void;
}
