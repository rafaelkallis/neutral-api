import { Type, Injectable, InternalServerErrorException } from '@nestjs/common';

/**
 * Context for mapping a model.
 */
export class ModelMapContext {
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
export abstract class AbstractModelMap<T, U> {
  /**
   * Maps the given model.
   * @param model The model to be mapped.
   * @param context
   */
  public map(model: T, context: object): U {
    return this.innerMap(model, new ModelMapContext(context));
  }

  protected abstract innerMap(model: T, context: ModelMapContext): U;
}

export const MODEL_MAP_METADATA = Symbol('MODEL_MAP_METADATA');

export class ModelMapMetadata<T, U> {
  public readonly sourceModel: Type<T>;
  public readonly targetModel: Type<U>;

  public constructor(sourceModel: Type<T>, targetModel: Type<U>) {
    this.sourceModel = sourceModel;
    this.targetModel = targetModel;
  }
}

/**
 *
 */
export function getModelMapMetadata<T, U>(
  target: object,
): ModelMapMetadata<T, U> | undefined {
  return Reflect.getMetadata(MODEL_MAP_METADATA, target.constructor);
}

/**
 * ModelMap
 */
export function ModelMap<T, U>(
  sourceModel: Type<T>,
  targetModel: Type<U>,
): ClassDecorator {
  return (modelMap: Function): void => {
    if (!(modelMap.prototype instanceof AbstractModelMap)) {
      throw new TypeError(
        `${modelMap.name} is not a model map, did you extend @${AbstractModelMap.name}?`,
      );
    }
    const metadata = new ModelMapMetadata(sourceModel, targetModel);
    Reflect.defineMetadata(MODEL_MAP_METADATA, metadata, modelMap);
    Injectable()(modelMap);
  };
}
