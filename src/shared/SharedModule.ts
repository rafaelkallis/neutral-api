import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { AmqpModule } from 'shared/amqp/AmqpModule';
import { ArchiveModule } from 'shared/archive/ArchiveModule';
import { UnitOfWorkModule } from 'shared/unit-of-work/UnitOfWorkModule';

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
    AmqpModule,
    ArchiveModule,
    UnitOfWorkModule,
  ],
  providers: [
    // @see https://docs.nestjs.com/techniques/serialization#overview
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
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
    AmqpModule,
    ArchiveModule,
    UnitOfWorkModule,
  ],
})
export class SharedModule {}
