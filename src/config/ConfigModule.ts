import { Module } from '@nestjs/common';
import { EnvalidConfigService } from 'config/infrastructure/EnvalidConfigService';
import { CONFIG } from 'config/application/Config';

/**
 * Config Module
 */
@Module({
  providers: [
    {
      provide: CONFIG,
      useClass: EnvalidConfigService,
    },
  ],
  exports: [CONFIG],
})
export class ConfigModule {}
