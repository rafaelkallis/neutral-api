import { Request, Response } from 'express';
import { User } from 'user/domain/User';
import { InternalServerErrorException } from '@nestjs/common';
import crypto from 'crypto';

/**
 * Telemetry Client.
 */
export abstract class TelemetryClient {
  private currentTransaction: TelemetryTransaction | null;

  public constructor() {
    this.currentTransaction = null;
  }

  public startHttpTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction {
    const httpTransaction = this.doStartHttpTransaction(
      this.computeHttpTransactionName(request),
      this.computeHttpTransactionId(request),
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

  protected abstract doStartHttpTransaction(
    transactionName: string,
    transactionId: string,
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction;

  protected computeHttpTransactionName(request: Request): string {
    return `${request.method} ${String(request.route.path)}`;
  }

  protected computeHttpTransactionId(_request: Request): string {
    // TODO check if transaction id exists in request header
    return crypto.randomBytes(16).toString('hex');
  }
}

export abstract class TelemetryTransaction {
  protected readonly transactionName: string;
  protected readonly transactionId: string;
  protected transactionStart: number;
  protected transactionEnd: number;
  protected transactionDuration: number;

  public constructor(transactionName: string, transactionId: string) {
    this.transactionName = transactionName;
    this.transactionId = transactionId;
    this.transactionStart = Date.now();
    this.transactionEnd = -1;
    this.transactionDuration = -1;
  }

  public abstract startAction(actionName: string): TelemetryAction;

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
    transactionId: string,
    request: Request,
    response: Response,
    user?: User,
  ) {
    super(transactionName, transactionId);
    this.request = request;
    this.response = response;
    this.user = user;
  }
}

export abstract class TelemetryAction {
  protected readonly transactionName: string;
  protected readonly transactionId: string;
  protected readonly actionName: string;
  protected actionStart: number;
  protected actionEnd: number;
  protected actionDuration: number;

  public constructor(
    transactionName: string,
    transactionId: string,
    actionName: string,
  ) {
    this.transactionName = transactionName;
    this.transactionId = transactionId;
    this.actionName = actionName;
    this.actionStart = Date.now();
    this.actionEnd = -1;
    this.actionDuration = -1;
  }

  public end(error?: Error): void {
    this.actionEnd = Date.now();
    this.actionDuration = this.actionEnd - this.actionStart;
    this.doEnd(error);
  }

  protected abstract doEnd(error?: Error): void;
}
