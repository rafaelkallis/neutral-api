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
export abstract class AbstractModelMap<T, TDto> {
  /**
   * Maps the given model to a dto.
   * @param model The model to be mapped.
   * @param context
   */
  public abstract toDto(model: T, context?: ModelMapContext): TDto;
}

export const MODEL_MAP_METADATA = Symbol('MODEL_MAP_METADATA');

/**
 *
 */
export function getModelMapMetadata(target: object): Type<object> | null {
  const metadata: Type<object> | undefined = Reflect.getMetadata(
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
export function ModelMap(targetModel: Type<object>): ClassDecorator {
  return (modelMap: Function): void => {
    if (!(modelMap.prototype instanceof AbstractModelMap)) {
      throw new TypeError(
        `${modelMap.name} is not a model map, did you extend @${AbstractModelMap.name}?`,
      );
    }
    Reflect.defineMetadata(MODEL_MAP_METADATA, targetModel, modelMap);
  };
}
