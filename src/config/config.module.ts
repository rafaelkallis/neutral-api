import { Module, Global } from '@nestjs/common';
import { Config, CONFIG } from 'config/config';
import { EnvalidConfig } from 'config/envalid-config';

/**
 * Config Module
 */
@Global()
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
