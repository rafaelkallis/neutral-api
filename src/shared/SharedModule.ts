import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
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
import { MagicLinkModule } from 'shared/magic-link/MagicLinkModule';
import { DomainExceptionFilter } from 'shared/application/filters/DomainExceptionFilter';
import { ValidationExceptionFilter } from 'shared/application/filters/ValidationExceptionFilter';

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
    MagicLinkModule,
  ],
  providers: [
    // @see https://docs.nestjs.com/techniques/serialization#overview
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
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
    MagicLinkModule,
  ],
})
export class SharedModule {}
