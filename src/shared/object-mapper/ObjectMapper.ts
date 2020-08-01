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
      const registeredObjectMaps = ObjectMap.registry
        .inverse()
        .get(Pair.of(sourceHierarchyClass, targetClass));
      if (!registeredObjectMaps) {
        continue;
      }
      const resolvedObjectMaps = (await this.serviceLocator.getServices(
        registeredObjectMaps,
      )) as Array<ObjectMap<TSource, TTarget>>;
      if (!resolvedObjectMaps) {
        continue;
      } else if (resolvedObjectMaps.length > 1) {
        throw new InternalServerErrorException(`conflicting`);
      }
      return await resolvedObjectMaps[0].map(source, context);
    }
    throw new InternalServerErrorException(
      `object map for ${sourceClass.name} -> ${targetClass.name} not found`,
    );
  }

  /**
   * Maps the given object instances to the specified object type.
   * @param iterable Array of objects to map.
   * @param targetClass The type to map to.
   * @param context Mapping context.
   */
  public async mapIterable<T>(
    iterable: Iterable<object>,
    targetClass: Class<T>,
    context: object = {},
  ): Promise<T[]> {
    const mappedObjects: T[] = [];
    for (const source of iterable) {
      const mappedObject = await this.map(source, targetClass, context);
      mappedObjects.push(mappedObject);
    }
    return mappedObjects;
  }
}
