export const CACHE_METADATA = Symbol('CACHE_METADATA');

export interface CacheContext {
  store: string;
  ttl: number;
  computeKey(...args: unknown[]): string;
}

/**
 * Cache Metadata
 */
export class CacheMetadataItem {
  public readonly propertyKey: string | symbol;
  public readonly context: CacheContext;

  public constructor(propertyKey: string | symbol, context: CacheContext) {
    this.propertyKey = propertyKey;
    this.context = context;
  }
}

/**
 *
 */
export function getCacheMetadataItems(
  target: object,
): ReadonlyArray<CacheMetadataItem> {
  let metadataItems: CacheMetadataItem[] | undefined = Reflect.getMetadata(
    CACHE_METADATA,
    target.constructor,
  );
  if (!metadataItems?.length) {
    metadataItems = [];
  }
  return metadataItems;
}

/**
 *
 */
export function Cache(context: Partial<CacheContext> = {}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const store =
      context.store || `${target.constructor.name}.${propertyKey.toString()}()`;
    const ttl = context.ttl || 1000;
    const computeKey = context.computeKey || JSON.stringify;

    const existingMetadataItems = getCacheMetadataItems(target);
    const newMetadataItem = new CacheMetadataItem(store, {
      store,
      ttl,
      computeKey,
    });
    Reflect.defineMetadata(
      CACHE_METADATA,
      [...existingMetadataItems, newMetadataItem],
      target.constructor,
    );
  };
}
