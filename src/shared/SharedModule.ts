import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { TelemetryModule } from 'shared/telemetry/TelemetryModule';
import { ConfigModule } from 'shared/config/ConfigModule';
import { ObjectStorageModule } from 'shared/object-storage/ObjectStorageModule';
import { TokenModule } from 'shared/token/TokenModule';
import { TypeOrmModule } from 'shared/typeorm/TypeOrmModule';
import { EmailModule } from 'shared/email/EmailModule';
import { EventModule } from 'shared/event/EventModule';
import { ObjectMapperModule } from 'shared/object-mapper/ObjectMapperModule';
import { SerializationModule } from 'shared/serialization/SerializationModule';
import { CacheModule } from 'shared/cache/CacheModule';
import { CommandModule } from 'shared/command/CommandModule';

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
    TypeOrmModule,
    EmailModule,
    EventModule,
    ObjectMapperModule,
    SerializationModule,
    CacheModule,
    CommandModule,
  ],
  exports: [
    UtilityModule,
    ConfigModule,
    TelemetryModule,
    ObjectStorageModule,
    TokenModule,
    TypeOrmModule,
    EmailModule,
    EventModule,
    ObjectMapperModule,
    SerializationModule,
    CacheModule,
    CommandModule,
  ],
})
export class SharedModule {}
