import { Type } from '@nestjs/common';
import { User } from 'user/domain/User';

/**
 * Context for mapping a model.
 */
export interface ModelMapContext {
  authUser?: User;
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
  public abstract map(model: T, context?: ModelMapContext): U;
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
): ModelMapMetadata<T, U> | null {
  const metadata: ModelMapMetadata<T, U> | undefined = Reflect.getMetadata(
    MODEL_MAP_METADATA,
    target.constructor,
  );
  if (!metadata) {
    return null;
  }
  return metadata;
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
  };
}
