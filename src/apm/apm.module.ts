import { Module } from '@nestjs/common';
import { ElasticApmService } from 'apm/elastic-apm.service';
import { ConfigModule } from 'config';
import { LoggerModule } from 'logger';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApmInterceptor } from 'apm/apm.interceptor';
import { APM_SERVICE } from 'apm/constants';

/**
 * Apm Module
 */
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    { provide: APM_SERVICE, useClass: ElasticApmService },
    { provide: APP_INTERCEPTOR, useClass: ApmInterceptor },
  ],
})
export class ApmModule {}
