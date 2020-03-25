import { Module } from '@nestjs/common';
import { EnvalidConfigService } from 'config/infrastructure/EnvalidConfigService';
import { Config } from 'config/application/Config';

/**
 * Config Module
 */
@Module({
  providers: [
    {
      provide: Config,
      useClass: EnvalidConfigService,
    },
  ],
  exports: [Config],
})
export class ConfigModule {}
