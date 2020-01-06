import { Module, Global } from '@nestjs/common';
import { LOGGER } from 'logger/logger';
import { ConsoleLogger } from 'logger/console-logger';

/**
 * Logger Module
 */
@Global()
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
