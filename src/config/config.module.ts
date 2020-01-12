import { Module } from '@nestjs/common';
import { EnvalidConfig } from 'config/envalid-config';
import { CONFIG } from 'config/constants';

/**
 * Config Module
 */
@Module({
  providers: [
    {
      provide: CONFIG,
      useClass: EnvalidConfig,
    },
  ],
  exports: [CONFIG],
})
export class ConfigModule {}
