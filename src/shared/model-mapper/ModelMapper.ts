import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
  Type,
} from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import {
  AbstractModelMap,
  getModelMapMetadata,
  ModelMapContext,
} from 'shared/model-mapper/ModelMap';

/**
 * Maps models.
 */
export abstract class ModelMapper {
  private readonly mappings: Map<
    Function,
    Map<Function, AbstractModelMap<unknown, unknown>>
  >;

  public constructor() {
    this.mappings = new Map();
  }

  protected addModelMap<T, U>(
    sourceModel: Type<T>,
    targetModel: Type<U>,
    modelMap: AbstractModelMap<T, U>,
  ) {
    let targetMap = this.mappings.get(sourceModel);
    if (!targetMap) {
      targetMap = new Map();
      this.mappings.set(sourceModel, targetMap);
    }
    const conflictingModelMap = targetMap.get(targetModel);
    if (conflictingModelMap) {
      throw new Error(
        `Conflicting model maps: ${modelMap.constructor.name} and ${conflictingModelMap.constructor.name} are model maps for ${sourceModel.name} -> ${targetModel.name}, remove one.`,
      );
    }
    targetMap.set(targetModel, modelMap);
  }

  public map<TDto>(
    model: object,
    targetModel: Type<TDto>,
    context?: ModelMapContext,
  ): TDto {
    const targetMap = this.mappings.get(model.constructor);
    if (!targetMap) {
      throw new InternalServerErrorException(
        `model map for ${model.constructor.name} -> ${targetModel.name} not found`,
      );
    }
    const modelMap = targetMap.get(targetModel);
    if (!modelMap) {
      throw new InternalServerErrorException(
        `model map for ${model.constructor.name} not found`,
      );
    }
    return (modelMap.map(model, context) as unknown) as TDto;
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
      const metadata = getModelMapMetadata(service);
      if (!metadata) {
        continue;
      }
      if (!(service instanceof AbstractModelMap)) {
        // already checked in decorator @ModelMap(MyModel)
        throw new Error();
      }
      this.addModelMap(metadata.sourceModel, metadata.targetModel, service);
    }
  }

  protected addModelMap<T, U>(
    sourceModel: Type<T>,
    targetModel: Type<U>,
    modelMap: AbstractModelMap<T, U>,
  ) {
    super.addModelMap(sourceModel, targetModel, modelMap);
    this.logger.log(
      `Registered {${targetModel.name}, ${modelMap.constructor.name}} model map`,
    );
  }
}
