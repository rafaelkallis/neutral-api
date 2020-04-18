import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
  Type,
} from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';

/**
 * Maps models.
 */
export class ObjectMapper {
  private readonly mappings: Map<
    Function,
    Map<Function, ObjectMap<unknown, unknown>>
  >;

  public constructor() {
    this.mappings = new Map();
  }

  public addObjectMap<T, U>(objectMap: ObjectMap<T, U>): void {
    const sourceType = objectMap.getSourceType();
    const targetType = objectMap.getTargetType();
    let targetMap = this.mappings.get(sourceType);
    if (!targetMap) {
      targetMap = new Map();
      this.mappings.set(sourceType, targetMap);
    }
    const conflictingObjectMap = targetMap.get(targetType);
    if (conflictingObjectMap) {
      throw new Error(
        `Conflicting object maps: ${objectMap.constructor.name} and ${conflictingObjectMap.constructor.name} are model maps for ${sourceType.name} -> ${targetType.name}, remove one.`,
      );
    }
    targetMap.set(targetType, objectMap);
  }

  /**
   * Maps the given object instance to the specified object type.
   * @param o Object to map.
   * @param targetObjectType The type to map to.
   * @param context Mapping context.
   */
  public map<T>(o: object, targetObjectType: Type<T>, context: object = {}): T {
    const targetMap = this.mappings.get(o.constructor);
    if (!targetMap) {
      throw new InternalServerErrorException(
        `object map for ${o.constructor.name} -> ${targetObjectType.name} not found`,
      );
    }
    const objectMap = targetMap.get(targetObjectType);
    if (!objectMap) {
      throw new InternalServerErrorException(
        `object map for ${o.constructor.name} not found`,
      );
    }
    return (objectMap.map(o, context) as unknown) as T;
  }

  public mapArray<T>(
    arr: object[],
    targetObjectType: Type<T>,
    context: object = {},
  ): T[] {
    return arr.map((o) => this.map(o, targetObjectType, context));
  }
}

@Injectable()
export class NestContainerObjectMapper extends ObjectMapper
  implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;

  public constructor(serviceExplorer: ServiceExplorer) {
    super();
    this.logger = new Logger(ObjectMapper.name, true);
    this.serviceExplorer = serviceExplorer;
  }

  public onModuleInit(): void {
    this.registerObjectMaps();
  }

  private registerObjectMaps(): void {
    for (const service of this.serviceExplorer.exploreServices()) {
      if (!(service instanceof ObjectMap)) {
        continue;
      }
      this.addObjectMap(service);
    }
  }

  public addObjectMap<T, U>(objectMap: ObjectMap<T, U>): void {
    super.addObjectMap(objectMap);
    this.logger.log(
      `Registered {${objectMap.getSourceType().name} -> ${
        objectMap.getTargetType().name
      }, ${objectMap.constructor.name}} object map`,
    );
  }
}
