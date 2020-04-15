import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { TelemetryModule } from 'shared/telemetry/TelemetryModule';
import { ConfigModule } from 'shared/config/ConfigModule';
import { ObjectStorageModule } from 'shared/object-storage/ObjectStorageModule';
import { TokenModule } from 'shared/token/TokenModule';
import { TypeOrmModule } from 'shared/typeorm/TypeOrmModule';
import { EmailModule } from 'shared/email/EmailModule';
import { ObjectMapperModule } from 'shared/object-mapper/ObjectMapperModule';
import { SerializationModule } from 'shared/serialization/SerializationModule';
import { CacheModule } from 'shared/cache/CacheModule';
import { MediatorModule } from 'shared/mediator/MediatorModule';
import { DomainEventModule } from 'shared/domain-event/DomainEventModule';

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
    ObjectMapperModule,
    SerializationModule,
    CacheModule,
    MediatorModule,
    DomainEventModule,
  ],
  exports: [
    UtilityModule,
    ConfigModule,
    TelemetryModule,
    ObjectStorageModule,
    TokenModule,
    TypeOrmModule,
    EmailModule,
    ObjectMapperModule,
    SerializationModule,
    CacheModule,
    MediatorModule,
    DomainEventModule,
  ],
})
export class SharedModule {}
