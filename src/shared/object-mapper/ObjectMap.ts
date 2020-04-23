import { Type, InternalServerErrorException } from '@nestjs/common';

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

  public abstract getSourceType(): Type<TSource>;
  public abstract getTargetType(): Type<TTarget>;
}
