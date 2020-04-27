import { Injectable, InternalServerErrorException, Type } from '@nestjs/common';
import { ObjectMapperRegistry } from 'shared/object-mapper/ObjectMapperRegistry';

/**
 * Maps objects.
 */
@Injectable()
export class ObjectMapper {
  private readonly registry: ObjectMapperRegistry;

  public constructor(registry: ObjectMapperRegistry) {
    this.registry = registry;
  }

  /**
   * Maps the given object instance to the specified object type.
   * @param o Object to map.
   * @param targetType The type to map to.
   * @param context Mapping context.
   */
  public map<TTarget>(
    o: Object,
    targetType: Type<TTarget>,
    context: object = {},
  ): TTarget {
    const objectMap = this.registry.get(
      o.constructor as Type<object>,
      targetType,
    );
    if (!objectMap) {
      throw new InternalServerErrorException(
        `object map for ${o.constructor.name} -> ${targetType.name} not found`,
      );
    }
    return objectMap.map(o, context);
  }

  /**
   * Maps the given object instances to the specified object type.
   * @param arr Array of objects to map.
   * @param targetType The type to map to.
   * @param context Mapping context.
   */
  public mapArray<T>(
    arr: object[],
    targetType: Type<T>,
    context: object = {},
  ): T[] {
    return arr.map((o) => this.map(o, targetType, context));
  }
}
