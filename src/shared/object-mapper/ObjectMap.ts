import { InternalServerErrorException } from '@nestjs/common';
import { Class } from 'shared/domain/Class';

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

/**
 *
 */
export abstract class ObjectMap<TSource, TTarget> {
  /**
   * Maps the given model.
   * @param model The model to be mapped.
   * @param context
   */
  public map(o: TSource, context: object): TTarget {
    return this.doMap(o, new ObjectMapContext(context));
  }

  protected abstract doMap(o: TSource, context: ObjectMapContext): TTarget;

  public abstract getSourceClass(): Class<TSource>;
  public abstract getTargetClass(): Class<TTarget>;
}
