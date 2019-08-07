import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LogService implements NestLoggerService {
  log(message: string) {
    this.logger.info(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

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
