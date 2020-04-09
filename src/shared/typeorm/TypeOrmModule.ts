import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { ObjectMapperModule } from 'shared/object-mapper/ObjectMapperModule';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule, ObjectMapperModule],
  providers: [TypeOrmClient],
  exports: [TypeOrmClient],
})
export class TypeOrmModule {}
