import { Module } from '@nestjs/common';
import {
  ModelMapper,
  NestContainerModelMapper,
} from 'shared/model-mapper/ModelMapper';
import { UtilityModule } from 'shared/utility/UtilityModule';

/**
 * Mapper Module
 */
@Module({
  imports: [UtilityModule],
  providers: [{ provide: ModelMapper, useClass: NestContainerModelMapper }],
  exports: [ModelMapper],
})
export class ModelMapperModule {}
