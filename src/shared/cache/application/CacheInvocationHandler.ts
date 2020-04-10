import {
  InvocationHandler,
  Method,
} from 'shared/utility/application/InvocationProxy';
import { CachePolicy } from 'shared/cache/application/CachePolicy';
import { CacheStore } from 'shared/cache/application/CacheStore';
import { CacheKeyComputer } from './CacheKeyComputer';

export class CacheInvocationHandler implements InvocationHandler {
  private readonly cachePolicy: CachePolicy;
  private readonly cacheStore: CacheStore;
  private readonly cacheKeyComputer: CacheKeyComputer;
  private readonly getKeyArgs: (...args: unknown[]) => string[];
  private readonly bucket: string;
  private readonly ttl: number;

  public constructor(
    cachePolicy: CachePolicy,
    cacheStore: CacheStore,
    cacheKeyComputer: CacheKeyComputer,
    getKeyArgs: (...args: unknown[]) => string[],
    bucket: string,
    ttl: number,
  ) {
    this.cachePolicy = cachePolicy;
    this.cacheStore = cacheStore;
    this.cacheKeyComputer = cacheKeyComputer;
    this.getKeyArgs = getKeyArgs;
    this.bucket = bucket;
    this.ttl = ttl;
  }

  public handleInvocation(method: Method, args: unknown[]): unknown {
    const keyArgs = this.getKeyArgs(...args);
    const key = this.cacheKeyComputer.computeKey([this.bucket, ...keyArgs]);
    if (this.cachePolicy.isAlive(key)) {
      const optionalCachedResult = this.cacheStore.get(key);
      if (optionalCachedResult.isPresent()) {
        return optionalCachedResult.orElseThrow(Error);
      }
    }
    const result = method.invoke(args);
    this.cacheStore.put(key, result);
    this.cachePolicy.access(key, this.ttl);
    return result;
  }
}
