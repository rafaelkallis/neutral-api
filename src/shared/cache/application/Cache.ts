import { Class } from 'shared/domain/Class';
import { DefaultMap } from 'shared/domain/DefaultMap';

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

const cacheRegistry: DefaultMap<
  Class<object>,
  CacheMetadataItem[]
> = DefaultMap.empty(() => []);

/**
 *
 */
export class Cache {
  public static registry = cacheRegistry.asReadonly();
  public static register(context: CacheContext): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
      const cacheMetadataItem = new CacheMetadataItem(
        propertyKey,
        context.getKeyArgs,
        context.bucket,
        context.ttl,
      );
      cacheRegistry.get(target.constructor).push(cacheMetadataItem);
    };
  }
}
