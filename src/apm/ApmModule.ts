import { Module } from '@nestjs/common';
import { ElasticApmService } from 'apm/infrastructure/ElasticApmService';
import { ConfigModule } from 'config/ConfigModule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApmInterceptor } from 'apm/application/ApmInterceptor';
import { Apm } from 'apm/application/Apm';

/**
 * Apm Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    { provide: Apm, useClass: ElasticApmService },
    { provide: APP_INTERCEPTOR, useClass: ApmInterceptor },
  ],
  exports: [Apm],
})
export class ApmModule {}
