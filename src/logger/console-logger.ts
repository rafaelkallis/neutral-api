import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { Logger } from 'logger/logger';
import { Logger as WinstonLogger } from 'winston';

/**
 * Console Logger
 */
@Injectable()
export class ConsoleLogger implements Logger {
  private readonly internalLogger: WinstonLogger;

  /**
   *
   */
  public constructor() {
    this.internalLogger = this.createWinstonConsoleLogger();
  }

  /**
   * Log a message at the default level.
   */
  public log(message: string): void {
    this.internalLogger.info(message);
  }

  /**
   * Log a message at the 'debug' level.
   */
  public debug(message: string): void {
    this.internalLogger.debug(message);
  }

  /**
   * Log a message at the 'info' level.
   */
  public info(message: string): void {
    this.internalLogger.info(message);
  }

  /**
   * Log a message at the 'warn' level.
   */
  public warn(message: string): void {
    this.internalLogger.warn(message);
  }

  /**
   * Log a message at the 'error' level.
   */
  public error(message: string): void {
    this.internalLogger.error(message);
  }

  private createWinstonConsoleLogger(): WinstonLogger {
    return createLogger({
      level: 'info',
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.simple(),
          ),
        }),
      ],
    });
  }
}
