import { Module } from '@nestjs/common';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UtilityModule } from 'shared/utility/UtilityModule';

/**
 * Object Mapper Module
 */
@Module({
  imports: [UtilityModule],
  providers: [ObjectMapper],
  exports: [ObjectMapper],
})
export class ObjectMapperModule {}
