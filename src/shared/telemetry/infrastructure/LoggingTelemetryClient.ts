import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
  HttpTelemetryTransaction,
} from 'shared/telemetry/application/TelemetryClient';
import { User } from 'user/domain/User';

/**
 * Logging Telemetry Client
 */
@Injectable()
export class LoggingTelemetryClient extends TelemetryClient {
  private readonly logger: LoggerService;

  public constructor() {
    super();
    this.logger = new Logger();
  }

  protected doStartHttpTransaction(
    transactionName: string,
    transactionId: string,
    request: Request,
    response: Response,
    user?: User,
  ): HttpTelemetryTransaction {
    transactionName = `Telemetry ${transactionName}`;
    return new LoggingTelemetryTransaction(
      transactionName,
      transactionId,
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
    transactionId: string,
    request: Request,
    response: Response,
    user: User | undefined,
    logger: LoggerService,
  ) {
    super(transactionName, transactionId, request, response, user);
    this.logger = logger;
  }

  public startAction(actionName: string): TelemetryAction {
    return new LoggingTelemetryAction(
      this.transactionName,
      this.transactionId,
      actionName,
      this.logger,
    );
  }

  protected doEnd(error?: Error): void {
    const logMessage = `{duration: ${this.transactionDuration}ms}`;
    if (error) {
      this.logger.error(
        `${logMessage} \n${error.name}: ${error.message}`,
        error.stack,
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
    transactionName: string,
    transactionId: string,
    actionName: string,
    logger: LoggerService,
  ) {
    super(transactionName, transactionId, actionName);
    this.logger = logger;
  }

  protected doEnd(error?: Error): void {
    const logMessage = `${this.actionName}: {duration: ${this.actionDuration}}`;
    if (error) {
      this.logger.error(logMessage, undefined, this.transactionName);
    } else {
      this.logger.log(logMessage, this.transactionName);
    }
  }
}
