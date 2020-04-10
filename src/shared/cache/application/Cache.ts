export const CACHE_METADATA = Symbol('CACHE_METADATA');

export interface CacheContext {
  getKeyArgs<TArgs extends any[]>(...args: TArgs): string[];
  bucket?: string;
  ttl?: number;
}

/**
 * Cache Metadata
 */
export class CacheMetadataItem implements CacheContext {
  public readonly propertyKey: string | symbol;
  public readonly getKeyArgs: <TArgs extends any[]>(...args: TArgs) => string[];
  public readonly bucket?: string;
  public readonly ttl?: number;

  public constructor(
    propertyKey: string | symbol,
    getKeyArgs: <TArgs extends any[]>(...args: TArgs) => string[],
    bucket?: string,
    ttl?: number,
  ) {
    this.propertyKey = propertyKey;
    this.getKeyArgs = getKeyArgs;
    this.bucket = bucket;
    this.ttl = ttl;
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
export function Cache(context: CacheContext): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const existingMetadataItems = getCacheMetadataItems(target);
    const newMetadataItem = new CacheMetadataItem(
      propertyKey,
      context.getKeyArgs,
      context.bucket,
      context.ttl,
    );
    Reflect.defineMetadata(
      CACHE_METADATA,
      [...existingMetadataItems, newMetadataItem],
      target.constructor,
    );
  };
}
