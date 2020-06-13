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

const associatedSourceTargets: InversableMap<
  Class<ObjectMap<unknown, unknown>>,
  Pair<Class<unknown>, Class<unknown>>
> = InversableMap.empty();

/**
 *
 */
export abstract class ObjectMap<TSource, TTarget> {
  /**
   * Maps the given model.
   * @param model The model to be mapped.
   * @param context
   */
  public map(source: TSource, context: object): TTarget | Promise<TTarget> {
    return this.doMap(source, new ObjectMapContext(context));
  }

  protected abstract doMap(
    o: TSource,
    context: ObjectMapContext,
  ): TTarget | Promise<TTarget>;

  public static assotiatedObjectMaps = associatedSourceTargets.asReadonly();

  public static mapFromTo<TSource, TTarget>(
    sourceClass: Class<TSource>,
    targetClass: Class<TTarget>,
  ): ClassDecorator {
    return (objectMapClass: Class<ObjectMap<TSource, TTarget>>): void => {
      associatedSourceTargets.set(
        objectMapClass,
        Pair.of(sourceClass, targetClass),
      );
    };
  }
}
