import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { RateLimitClient } from 'shared/rate-limit/application/RateLimitClient';
import { RateLimitBackend } from './application/RateLimitBackend';
import { MemoryRateLimitBackend } from './infrastructure/MemoryRateLimitBackend';

@Module({
  imports: [ConfigModule, UtilityModule],
  providers: [
    RateLimitClient,
    {
      provide: RateLimitBackend,
      useClass: MemoryRateLimitBackend,
    },
  ],
  exports: [RateLimitClient],
})
export class RateLimitModule {}
