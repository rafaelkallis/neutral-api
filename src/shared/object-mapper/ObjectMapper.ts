import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
  Type,
} from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import {
  getObjectMapMetadata,
  AbstractObjectMap,
} from 'shared/object-mapper/ObjectMap';

/**
 * Maps models.
 */
export class ObjectMapper {
  private readonly mappings: Map<
    Function,
    Map<Function, AbstractObjectMap<unknown, unknown>>
  >;

  public constructor() {
    this.mappings = new Map();
  }

  public addObjectMap<T, U>(
    sourceObjectType: Type<T>,
    targetObjectType: Type<U>,
    objectMap: AbstractObjectMap<T, U>,
  ) {
    let targetMap = this.mappings.get(sourceObjectType);
    if (!targetMap) {
      targetMap = new Map();
      this.mappings.set(sourceObjectType, targetMap);
    }
    const conflictingObjectMap = targetMap.get(targetObjectType);
    if (conflictingObjectMap) {
      throw new Error(
        `Conflicting object maps: ${objectMap.constructor.name} and ${conflictingObjectMap.constructor.name} are model maps for ${sourceObjectType.name} -> ${targetObjectType.name}, remove one.`,
      );
    }
    targetMap.set(targetObjectType, objectMap);
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
      const metadata = getObjectMapMetadata(service);
      if (!metadata) {
        continue;
      }
      if (!(service instanceof AbstractObjectMap)) {
        // already checked in decorator @ObjectMap(MyObject, MyOtherObject)
        throw new Error();
      }
      this.addObjectMap(
        metadata.sourceObjectType,
        metadata.targetObjectType,
        service,
      );
    }
  }

  public addObjectMap<T, U>(
    sourceObjectType: Type<T>,
    targetObjectType: Type<U>,
    objectMap: AbstractObjectMap<T, U>,
  ) {
    super.addObjectMap(sourceObjectType, targetObjectType, objectMap);
    this.logger.log(
      `Registered {${targetObjectType.name}, ${objectMap.constructor.name}} object map`,
    );
  }
}
