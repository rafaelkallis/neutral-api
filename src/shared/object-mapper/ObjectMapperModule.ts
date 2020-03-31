import { Module } from '@nestjs/common';
import {
  ObjectMapper,
  NestContainerObjectMapper,
} from 'shared/object-mapper/ObjectMapper';
import { UtilityModule } from 'shared/utility/UtilityModule';

/**
 * Object Mapper Module
 */
@Module({
  imports: [UtilityModule],
  providers: [{ provide: ObjectMapper, useClass: NestContainerObjectMapper }],
  exports: [ObjectMapper],
})
export class ObjectMapperModule {}
