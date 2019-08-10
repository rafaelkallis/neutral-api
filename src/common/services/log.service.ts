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
  log(message: string) {
    this.logger.info(message);
  }

  /**
   * Log a message at the 'debug' level.
   */
  debug(message: string) {
    this.logger.debug(message);
  }

  /**
   * Log a message at the 'info' level.
   */
  info(message: string) {
    this.logger.info(message);
  }

  /**
   * Log a message at the 'warn' level.
   */
  warn(message: string) {
    this.logger.warn(message);
  }

  /**
   * Log a message at the 'error' level.
   */
  error(message: string) {
    this.logger.error(message);
  }

  private logger = createLogger({
    level: 'info',
    transports: [
      new transports.Console({
        format: format.combine(format.colorize({ all: true }), format.simple()),
      }),
    ],
  });
}
