import { Type, Injectable, InternalServerErrorException } from '@nestjs/common';

/**
 * Context for object mapping.
 */
export class ObjectMapContext {
  private readonly props: object;
  public constructor(props: object) {
    this.props = props;
  }

  public get<T>(key: string, type: Type<T>): T {
    const value = (this.props as Record<string, unknown>)[key];
    if (!value) {
      throw new InternalServerErrorException(
        `property "${key}" no found in model map context`,
      );
    }
    if (!(value instanceof type)) {
      throw new InternalServerErrorException(
        `property "${key}" is not instance of ${type.name}`,
      );
    }
    return value;
  }
}

/**
 *
 */
export abstract class AbstractObjectMap<T, U> {
  /**
   * Maps the given model.
   * @param model The model to be mapped.
   * @param context
   */
  public map(o: T, context: object): U {
    return this.innerMap(o, new ObjectMapContext(context));
  }

  protected abstract innerMap(o: T, context: ObjectMapContext): U;
}

export const OBJECT_MAP_METADATA = Symbol('OBJECT_MAP_METADATA');

export class ObjectMapMetadata<T, U> {
  public readonly sourceObjectType: Type<T>;
  public readonly targetObjectType: Type<U>;

  public constructor(sourceObjectType: Type<T>, targetObjectType: Type<U>) {
    this.sourceObjectType = sourceObjectType;
    this.targetObjectType = targetObjectType;
  }
}

/**
 *
 */
export function getObjectMapMetadata<T, U>(
  target: object,
): ObjectMapMetadata<T, U> | undefined {
  return Reflect.getMetadata(OBJECT_MAP_METADATA, target.constructor);
}

/**
 * ObjectMap class decorator.
 */
export function ObjectMap<T, U>(
  sourceObjectType: Type<T>,
  targetObjectType: Type<U>,
): ClassDecorator {
  return (objectMapType: Function): void => {
    if (!(objectMapType.prototype instanceof AbstractObjectMap)) {
      throw new TypeError(
        `${objectMapType.name} is not an object map, did you extend @${AbstractObjectMap.name}?`,
      );
    }
    const metadata = new ObjectMapMetadata(sourceObjectType, targetObjectType);
    Reflect.defineMetadata(OBJECT_MAP_METADATA, metadata, objectMapType);
    Injectable()(objectMapType);
  };
}
