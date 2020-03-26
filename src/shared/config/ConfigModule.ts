import { Module } from '@nestjs/common';
import { EnvalidConfig } from 'shared/config/infrastructure/EnvalidConfig';
import { Config } from 'shared/config/application/Config';

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
