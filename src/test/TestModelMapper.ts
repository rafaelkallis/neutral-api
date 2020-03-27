import { ModelMapper } from 'shared/model-mapper/ModelMapper';
import { AbstractModelMap } from 'shared/model-mapper/ModelMap';

export class TestModelMapper extends ModelMapper {
  public registerModelMap(
    targetModel: Function,
    modelMap: AbstractModelMap<object, object>,
  ) {
    super.registerModelMap(targetModel, modelMap);
  }
}
