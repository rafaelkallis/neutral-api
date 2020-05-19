import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TelemetryInterceptor } from 'shared/telemetry/application/TelemetryInterceptor';
import { TelemetryClient } from 'shared/telemetry/application/TelemetryClient';
import { AzureMonitorTelemetryClient } from 'shared/telemetry/infrastructure/AzureMonitorTelemetryClient';
import { Config } from 'shared/config/application/Config';
import { LoggingTelemetryClient } from 'shared/telemetry/infrastructure/LoggingTelemetryClient';
import { TelemetryActionManager } from 'shared/telemetry/application/TelemetryActionManager';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { PerformanceMeasurer } from './application/PerformanceMeasurer';
import { Environment } from 'shared/utility/application/Environment';

/**
 * Telemetry Module
 */
@Module({
  imports: [ConfigModule, UtilityModule],
  providers: [
    {
      provide: TelemetryClient,
      useFactory: (
        environment: Environment,
        config: Config,
        performanceMeasurer: PerformanceMeasurer,
      ): TelemetryClient => {
        if (environment.isProduction()) {
          return new AzureMonitorTelemetryClient(config, performanceMeasurer);
        } else {
          return new LoggingTelemetryClient();
        }
      },
      inject: [Environment, Config, PerformanceMeasurer],
    },
    { provide: APP_INTERCEPTOR, useClass: TelemetryInterceptor },
    TelemetryActionManager,
    PerformanceMeasurer,
  ],
  exports: [TelemetryClient],
})
export class TelemetryModule {}
