import { Module } from '@nestjs/common';
import { EnvalidConfig } from 'config/infrastructure/EnvalidConfig';
import { Config } from 'config/application/Config';

/**
 * Config Module
 */
@Module({
  providers: [
    {
      provide: Config,
      useClass: EnvalidConfig,
    },
  ],
  exports: [Config],
})
export class ConfigModule {}
