import { Module } from '@nestjs/common';
import { ConfigModule } from 'config/ConfigModule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TelemetryInterceptor } from 'telemetry/application/TelemetryInterceptor';
import { TelemetryClient } from 'telemetry/application/TelemetryClient';
import { AzureMonitorTelemetryClient } from 'telemetry/infrastructure/AzureMonitorTelemetryClient';
import { Config } from 'config/application/Config';
import { LoggingTelemetryClient } from './infrastructure/LoggingTelemetryClient';

/**
 * Telemetry Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TelemetryClient,
      useFactory: (config: Config) => {
        if (config.isProduction()) {
          return new AzureMonitorTelemetryClient(config);
        } else {
          return new LoggingTelemetryClient();
        }
      },
      inject: [Config],
    },
    { provide: APP_INTERCEPTOR, useClass: TelemetryInterceptor },
  ],
  exports: [TelemetryClient],
})
export class TelemetryModule {}
