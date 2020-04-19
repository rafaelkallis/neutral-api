import {
  Injectable,
  Type,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';

/**
 * Registry of Object Maps.
 */
@Injectable()
export class ObjectMapperRegistry {
  private readonly logger: Logger;
  private readonly registry: Map<string, ObjectMap<unknown, unknown>>;

  public constructor() {
    this.logger = new Logger(ObjectMapperRegistry.name);
    this.registry = new Map();
  }

  public register<TSource, TTarget>(
    objectMap: ObjectMap<TSource, TTarget>,
  ): void {
    const sourceType = objectMap.getSourceType();
    const targetType = objectMap.getTargetType();
    const objectMapKey = this.computeObjectMapKey(sourceType, targetType);
    const conflictingObjectMap = this.registry.get(objectMapKey);
    if (conflictingObjectMap) {
      throw new InternalServerErrorException(
        `Conflicting object maps: ${objectMap.constructor.name} and ${conflictingObjectMap.constructor.name} are model maps for ${sourceType.name} -> ${targetType.name}, remove one.`,
      );
    }
    this.logger.log(
      `Registered {${sourceType.name} -> ${targetType.name}, ${objectMap.constructor.name}} object map`,
    );
    this.registry.set(objectMapKey, objectMap);
  }

  public get<TSource, TTarget>(
    sourceType: Type<TSource>,
    targetType: Type<TTarget>,
  ): ObjectMap<TSource, TTarget> | undefined {
    const objectMapKey = this.computeObjectMapKey(sourceType, targetType);
    return this.registry.get(objectMapKey) as
      | ObjectMap<TSource, TTarget>
      | undefined;
  }

  private computeObjectMapKey<TSource, TTarget>(
    sourceType: Type<TSource>,
    targetType: Type<TTarget>,
  ): string {
    const sourceName = sourceType.name;
    const targetName = targetType.name;
    const sourceJson = JSON.stringify(sourceType);
    const targetJson = JSON.stringify(targetType);
    return `[${sourceName},${targetName}] ${sourceJson} ${targetJson}`;
  }
}
