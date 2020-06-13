import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Class, ClassHierarchyIterable } from 'shared/domain/Class';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';
import { ObjectMap } from './ObjectMap';
import { Pair } from 'shared/domain/Pair';

/**
 * Maps objects.
 */
@Injectable()
export class ObjectMapper {
  private readonly serviceLocator: ServiceLocator;

  public constructor(serviceLocator: ServiceLocator) {
    this.serviceLocator = serviceLocator;
  }

  /**
   * Maps the given object instance to the specified object type.
   * @param source Object to map.
   * @param targetClass The type to map to.
   * @param context Mapping context.
   */
  public async map<TSource extends object, TTarget>(
    source: TSource,
    targetClass: Class<TTarget>,
    context: object = {},
  ): Promise<TTarget> {
    const sourceClass: Class<TSource> = source.constructor;
    for (const sourceHierarchyClass of ClassHierarchyIterable.of(sourceClass)) {
      const associatedObjectMaps = ObjectMap.assotiatedObjectMaps
        .inverse()
        .get(Pair.of(sourceHierarchyClass, targetClass));
      if (!associatedObjectMaps) {
        continue;
      }
      const resolvedObjectMaps: ObjectMap<TSource, TTarget>[] = [];
      for (const objectMapClass of associatedObjectMaps) {
        const resolvedObjectMap = await this.serviceLocator.getServiceOrNull(
          objectMapClass as Class<ObjectMap<TSource, TTarget>>,
        );
        if (!resolvedObjectMap) {
          continue;
        }
        resolvedObjectMaps.push(resolvedObjectMap);
      }
      if (resolvedObjectMaps.length === 0) {
        continue;
      }
      if (resolvedObjectMaps.length > 1) {
        throw new InternalServerErrorException(
          `conflicting object maps for ${sourceClass.name} -> ${targetClass.name}`,
        );
      }
      return resolvedObjectMaps[0].map(source, context);
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
  public async mapArray<T>(
    arr: ReadonlyArray<object>,
    targetClass: Class<T>,
    context: object = {},
  ): Promise<T[]> {
    const mapped: T[] = [];
    for (const o of arr) {
      mapped.push(await this.map(o, targetClass, context));
    }
    return mapped;
  }
}
