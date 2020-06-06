import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ObjectMapperRegistry } from 'shared/object-mapper/ObjectMapperRegistry';
import { Class, ClassHierarchyIterable } from 'shared/domain/Class';

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
   * @param source Object to map.
   * @param targetClass The type to map to.
   * @param context Mapping context.
   */
  public map<TSource extends object, TTarget>(
    source: TSource,
    targetClass: Class<TTarget>,
    context: object = {},
  ): TTarget {
    const sourceClass: Class<TSource> = source.constructor;
    for (const sourceHierarchyClass of ClassHierarchyIterable.of(sourceClass)) {
      const objectMap = this.registry.get(sourceHierarchyClass, targetClass);
      if (objectMap) {
        return objectMap.map(source, context);
      }
    }
    throw new InternalServerErrorException(
      `object map for ${sourceClass.name} -> ${targetClass.name} not found`,
    );
  }

  /**
   * Maps the given object instances to the specified object type.
   * @param arr Array of objects to map.
   * @param targetClass The type to map to.
   * @param context Mapping context.
   */
  public mapArray<T>(
    arr: ReadonlyArray<object>,
    targetClass: Class<T>,
    context: object = {},
  ): T[] {
    return arr.map((o) => this.map(o, targetClass, context));
  }
}
