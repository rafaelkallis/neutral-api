import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TelemetryClient,
  TelemetryAction,
} from 'telemetry/application/TelemetryClient';

/**
 * Local Telemetry Client
 */
@Injectable()
export class LoggingTelemetryClient extends TelemetryClient {
  private currentTransaction: Logger | null;

  public constructor() {
    super();
    this.currentTransaction = null;
  }

  public setTransaction(request: Request, response: Response): void {
    const endpoint = request.route.path;
    const newTransaction = new Logger(`Telemetry ${endpoint}`, true);
    newTransaction.log('');
    this.currentTransaction = newTransaction;
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

class LoggingTelemetryAction implements TelemetryAction {
  private readonly logger: LoggerService;
  private readonly name: string;
  private readonly start: number;

  public constructor(logger: LoggerService, name: string) {
    this.logger = logger;
    this.name = name;
    this.start = Date.now();
    this.logger.log(`${name}: {start: ${this.start}}`);
  }

  public end(): void {
    const end = Date.now();
    const duration = end - this.start;
    this.logger.log(`${this.name}: {end: ${end}, duration: ${duration}}`);
  }
}
