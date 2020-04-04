import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { TelemetryModule } from 'shared/telemetry/TelemetryModule';
import { ConfigModule } from 'shared/config/ConfigModule';
import { ObjectStorageModule } from 'shared/object-storage/ObjectStorageModule';
import { TokenModule } from 'shared/token/TokenModule';
import { DatabaseModule } from 'shared/database/DatabaseModule';
import { EmailModule } from 'shared/email/EmailModule';
import { EventModule } from 'shared/event/EventModule';
import { ObjectMapperModule } from 'shared/object-mapper/ObjectMapperModule';
import { SerializationModule } from 'shared/serialization/SerializationModule';

/**
 * Shared Module
 */
@Module({
  imports: [
    UtilityModule,
    ConfigModule,
    TelemetryModule,
    ObjectStorageModule,
    TokenModule,
    DatabaseModule,
    EmailModule,
    EventModule,
    ObjectMapperModule,
    SerializationModule,
  ],
  exports: [
    UtilityModule,
    ConfigModule,
    TelemetryModule,
    ObjectStorageModule,
    TokenModule,
    DatabaseModule,
    EmailModule,
    EventModule,
    ObjectMapperModule,
    SerializationModule,
  ],
})
export class SharedModule {}
