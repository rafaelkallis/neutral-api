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

/**
 * Telemetry Module
 */
@Module({
  imports: [ConfigModule, UtilityModule],
  providers: [
    {
      provide: TelemetryClient,
      useFactory: (config: Config): TelemetryClient => {
        if (config.isProduction()) {
          return new AzureMonitorTelemetryClient(config);
        } else {
          return new LoggingTelemetryClient();
        }
      },
      inject: [Config],
    },
    { provide: APP_INTERCEPTOR, useClass: TelemetryInterceptor },
    TelemetryActionManager,
  ],
  exports: [TelemetryClient],
})
export class TelemetryModule {}
