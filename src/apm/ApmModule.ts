import { Module } from '@nestjs/common';
import { ElasticApmService } from 'apm/infrastructure/ElasticApmService';
import { ConfigModule } from 'config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApmInterceptor } from 'apm/application/ApmInterceptor';
import { APM } from 'apm/application/Apm';

/**
 * Apm Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    { provide: APM, useClass: ElasticApmService },
    { provide: APP_INTERCEPTOR, useClass: ApmInterceptor },
  ],
})
export class ApmModule {}
