import { Module } from '@nestjs/common';
import { LOGGER } from 'logger/constants';
import { ConsoleLogger } from 'logger/console-logger';

/**
 * Logger Module
 */
@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: ConsoleLogger,
    },
  ],
  exports: [LOGGER],
})
export class LoggerModule {}
