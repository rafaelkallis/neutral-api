import { Module } from '@nestjs/common';
import { LOGGER } from 'logger/constants';
import { ConsoleLoggerService } from 'logger/console-logger.service';

/**
 * Logger Module
 */
@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: ConsoleLoggerService,
    },
  ],
  exports: [LOGGER],
})
export class LoggerModule {}
