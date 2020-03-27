import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import {
  AbstractModelMap,
  getModelMapMetadata,
  ModelMapContext,
} from 'shared/model-mapper/ModelMap';

/**
 * Maps models to (primarily) dtos.
 */
export abstract class ModelMapper {
  private readonly modelMaps: Map<Function, AbstractModelMap<object, object>>;

  public constructor() {
    this.modelMaps = new Map();
  }

  protected registerModelMap(
    targetModel: Function,
    modelMap: AbstractModelMap<object, object>,
  ) {
    const conflictingModelMap = this.modelMaps.get(targetModel);
    if (conflictingModelMap) {
      throw new Error(
        `Conflicting model maps: ${modelMap.constructor.name} and ${conflictingModelMap.constructor.name} are model maps for ${targetModel.name}, remove one.`,
      );
    }
    this.modelMaps.set(targetModel, modelMap);
  }

  public map<TDto = object>(model: object, context?: ModelMapContext): TDto {
    const modelMap = this.modelMaps.get(model.constructor);
    if (!modelMap) {
      throw new InternalServerErrorException(
        `model map for ${model.constructor.name} not found`,
      );
    }
    return (modelMap.toDto(model, context) as unknown) as TDto;
  }
}

/**
 * Maps the given model to the configured dto.
 * @param model
 * @param context
 */
@Injectable()
export class NestContainerModelMapper extends ModelMapper
  implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;

  public constructor(serviceExplorer: ServiceExplorer) {
    super();
    this.logger = new Logger(ModelMapper.name, true);
    this.serviceExplorer = serviceExplorer;
  }

  public onModuleInit(): void {
    this.registerModelMaps();
  }

  private registerModelMaps(): void {
    for (const service of this.serviceExplorer.exploreServices()) {
      const targetModel = getModelMapMetadata(service);
      if (!targetModel) {
        continue;
      }
      if (!(service instanceof AbstractModelMap)) {
        // already checked in decorator @ModelMap(MyModel)
        throw new Error();
      }
      this.registerModelMap(targetModel, service);
    }
  }

  protected registerModelMap(
    targetModel: Function,
    modelMap: AbstractModelMap<object, object>,
  ) {
    super.registerModelMap(targetModel, modelMap);
    this.logger.log(
      `Registered {${targetModel.name}, ${modelMap.constructor.name}} model map`,
    );
  }
}
