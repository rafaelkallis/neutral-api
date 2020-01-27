import { Module } from '@nestjs/common';
import { EnvalidConfigService } from 'config/envalid-config.service';
import { CONFIG } from 'config/constants';

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
