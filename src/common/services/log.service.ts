import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

/**
 * Log Service
 */
@Injectable()
export class LogService implements NestLoggerService {
  /**
   * Log a message at the default level.
   */
  public log(message: string): void {
    this.logger.info(message);
  }

  /**
   * Log a message at the 'debug' level.
   */
  public debug(message: string): void {
    this.logger.debug(message);
  }

  /**
   * Log a message at the 'info' level.
   */
  public info(message: string): void {
    this.logger.info(message);
  }

  /**
   * Log a message at the 'warn' level.
   */
  public warn(message: string): void {
    this.logger.warn(message);
  }

  /**
   * Log a message at the 'error' level.
   */
  public error(message: string): void {
    this.logger.error(message);
  }

  private readonly logger = createLogger({
    level: 'info',
    transports: [
      new transports.Console({
        format: format.combine(format.colorize({ all: true }), format.simple()),
      }),
    ],
  });
}
