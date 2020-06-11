import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { ObjectMapperModule } from 'shared/object-mapper/ObjectMapperModule';
import { TypeOrmRepository } from 'shared/typeorm/TypeOrmRepository';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule, ObjectMapperModule],
  providers: [TypeOrmClient, TypeOrmRepository],
  exports: [TypeOrmClient, TypeOrmRepository],
})
export class TypeOrmModule {}
