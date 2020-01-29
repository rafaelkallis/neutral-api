import { Module } from '@nestjs/common';
import { ElasticApmService } from 'apm/elastic-apm.service';
import { ConfigModule } from 'config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApmInterceptor } from 'apm/apm.interceptor';
import { APM_SERVICE } from 'apm/constants';

/**
 * Apm Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    { provide: APM_SERVICE, useClass: ElasticApmService },
    { provide: APP_INTERCEPTOR, useClass: ApmInterceptor },
  ],
})
export class ApmModule {}
