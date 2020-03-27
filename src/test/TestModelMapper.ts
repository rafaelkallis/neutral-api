import { ModelMapper } from 'shared/model-mapper/ModelMapper';
import { AbstractModelMap } from 'shared/model-mapper/ModelMap';
import { Type } from '@nestjs/common';

export class TestModelMapper extends ModelMapper {
  public addModelMap<T, U>(
    sourceModel: Type<T>,
    targetModel: Type<U>,
    modelMap: AbstractModelMap<T, U>,
  ) {
    super.addModelMap(sourceModel, targetModel, modelMap);
  }
}
