import { InternalServerErrorException } from '@nestjs/common';
import { Class } from 'shared/domain/Class';
import { InversableMap } from 'shared/domain/InversableMap';
import { Pair } from 'shared/domain/Pair';

/**
 * Context for object mapping.
 */
export class ObjectMapContext {
  private readonly props: object;
  public constructor(props: object) {
    this.props = props;
  }

  public get<T>(key: string, clazz: Class<T>): T {
    const value = (this.props as Record<string, unknown>)[key];
    if (!value) {
      throw new InternalServerErrorException(
        `property "${key}" no found in model map context`,
      );
    }
    if (!(value instanceof clazz)) {
      throw new InternalServerErrorException(
        `property "${key}" is not instance of ${clazz.name}`,
      );
    }
    return value as T;
  }
}

const objectMapRegistry: InversableMap<
  Class<ObjectMap<unknown, unknown>>,
  Pair<Class<unknown>, Class<unknown>>
> = InversableMap.empty();

/**
 *
 */
export abstract class ObjectMap<TSource, TTarget> {
  public static register(
    sourceClass: Class<unknown>,
    targetClass: Class<unknown>,
  ): ClassDecorator {
    return (objectMapClass: Class<ObjectMap<unknown, unknown>>): void => {
      objectMapRegistry.set(objectMapClass, Pair.of(sourceClass, targetClass));
    };
  }
  public static registry = objectMapRegistry.asReadonly();

  /**
   * Maps the given model.
   * @param model The model to be mapped.
   * @param context
   */
  public async map(source: TSource, context: object): Promise<TTarget> {
    return this.doMap(source, new ObjectMapContext(context));
  }

  protected abstract doMap(
    o: TSource,
    context: ObjectMapContext,
  ): TTarget | Promise<TTarget>;
}
