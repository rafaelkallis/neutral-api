import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { ObjectMapperModule } from 'shared/object-mapper/ObjectMapperModule';
import { TypeOrmEntityRegistry } from 'shared/typeorm/TypeOrmEntityRegistry';
import { UnitOfWorkModule } from 'shared/unit-of-work/UnitOfWorkModule';
import { CommittedModelTypeOrmPersistConnector } from 'shared/typeorm/CommittedModelTypeOrmPersistConnector';

@Module({
  imports: [ConfigModule, ObjectMapperModule, UnitOfWorkModule],
  providers: [
    TypeOrmClient,
    TypeOrmEntityRegistry,
    CommittedModelTypeOrmPersistConnector,
  ],
  exports: [TypeOrmClient],
})
export class TypeOrmModule {}
