import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LogService {
  debug(arg: string) {
    this.logger.debug(arg);
  }

  info(arg: string) {
    this.logger.info(arg);
  }

  warn(arg: string) {
    this.logger.warn(arg);
  }

  error(arg: string) {
    this.logger.error(arg);
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
