import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  TelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';

/**
 * Local Telemetry Client
 */
@Injectable()
export class LoggingTelemetryClient extends TelemetryClient {
  private currentTransaction: Logger | null;
  private readonly logger: LoggerService;

  public constructor() {
    super();
    this.currentTransaction = null;
    this.logger = new Logger();
  }

  public setTransaction(request: Request, response: Response): void {
    const httpEndpoint = this.getHttpEndpoint(request);
    const newTransaction = new Logger(`Telemetry ${httpEndpoint}`, true);
    newTransaction.log('');
    this.currentTransaction = newTransaction;
  }

  public createHttpTransaction(
    request: Request,
    response: Response,
  ): TelemetryTransaction {
    const httpEndpoint = this.getHttpEndpoint(request);
    return new LoggingTelemetryTransaction(this.logger, httpEndpoint);
  }

  public createAction(name: string): TelemetryAction {
    if (!this.currentTransaction) {
      throw new Error('forgot to setTransaction()');
    }
    return new LoggingTelemetryAction(this.currentTransaction, name);
  }

  public error(error: Error): void {
    if (!this.currentTransaction) {
      throw new Error('forgot to setTransaction()');
    }
    this.currentTransaction.error(
      `${error.name}: ${error.message}`,
      error.stack?.toString(),
    );
  }
}

class LoggingTelemetryTransaction extends TelemetryTransaction {
  readonly logger: LoggerService;

  public constructor(logger: LoggerService, transactionName: string) {
    super(transactionName);
    this.logger = logger;
  }

  public createAction(actionName: string): TelemetryAction {
    return new LoggingTelemetryAction(
      this.logger,
      this.transactionName,
      actionName,
    );
  }

  protected doEnd(error?: Error): void {
    const logMessage = `{start: ${this.transactionStart}, end: ${this.transactionEnd}, duration: ${this.transactionDuration}ms}`;
    if (error) {
      this.logger.error(
        `${logMessage} \n${error.name}: ${error.message}`,
        this.transactionName,
      );
    } else {
      this.logger.log(logMessage, this.transactionName);
    }
  }
}

class LoggingTelemetryAction extends TelemetryAction {
  readonly logger: LoggerService;

  public constructor(
    logger: LoggerService,
    transactionName: string,
    actionName: string,
  ) {
    super(transactionName, actionName);
    this.logger = logger;
  }

  protected doEnd(error?: Error): void {
    const logMessage = `${this.actionName}: {start: ${this.actionStart}, end: ${this.actionEnd}, duration: ${this.actionDuration}}`;
    if (error) {
      this.logger.error(logMessage, undefined, this.transactionName);
    } else {
      this.logger.log(logMessage, this.transactionName);
    }
  }
}
