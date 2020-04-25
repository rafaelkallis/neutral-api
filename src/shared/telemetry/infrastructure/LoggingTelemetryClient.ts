import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  HttpTelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';
import { User } from 'user/domain/User';

/**
 * Local Telemetry Client
 */
@Injectable()
export class LoggingTelemetryClient extends TelemetryClient {
  private readonly logger: LoggerService;

  public constructor() {
    super();
    this.logger = new Logger();
  }

  protected doCreateHttpTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction {
    const httpTransactionName = `Telemetry ${this.computeHttpTransactionName(
      request,
    )}`;
    return new LoggingTelemetryTransaction(
      httpTransactionName,
      request,
      response,
      user,
      this.logger,
    );
  }
}

class LoggingTelemetryTransaction extends HttpTelemetryTransaction {
  readonly logger: LoggerService;

  public constructor(
    transactionName: string,
    request: Request,
    response: Response,
    user: User | undefined,
    logger: LoggerService,
  ) {
    super(transactionName, request, response, user);
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
