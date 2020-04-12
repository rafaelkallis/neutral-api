import {
  OnModuleInit,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CacheStore } from 'shared/cache/application/CacheStore';
import {
  CachePolicy,
  CacheItemExpiredHandler,
} from 'shared/cache/application/CachePolicy';
import {
  InvocationProxy,
  Method,
  InvocationHandler,
} from 'shared/utility/application/InvocationProxy';
import { CacheKeyComputer } from 'shared/cache/application/CacheKeyComputer';

export interface CacheMethodContext {
  target: any;
  method: string | symbol;
  bucket?: string;
  ttl?: number;
  getKeyArgs<TArgs extends any[]>(...args: TArgs): string[];
}

/**
 * Cache Client, a cache facade.
 */
@Injectable()
export class CacheClient implements OnModuleInit, CacheItemExpiredHandler {
  private readonly invocationProxy: InvocationProxy;
  private readonly cachePolicy: CachePolicy;
  private readonly cacheStore: CacheStore;
  private readonly cacheKeyComputer: CacheKeyComputer;

  public constructor(
    invocationProxy: InvocationProxy,
    cachePolicy: CachePolicy,
    cacheStore: CacheStore,
    cacheKeyComputer: CacheKeyComputer,
  ) {
    this.invocationProxy = invocationProxy;
    this.cachePolicy = cachePolicy;
    this.cacheStore = cacheStore;
    this.cacheKeyComputer = cacheKeyComputer;
  }

  public onModuleInit(): void {
    this.cachePolicy.registerCacheItemExpiredHandler(this);
  }

  public cacheMethod(context: CacheMethodContext): void {
    const bucket =
      context.bucket ||
      `method ${context.target.constructor.name} ${context.method.toString()}`;
    const ttl = context.ttl || 1000;
    const invocationHandler: InvocationHandler = {
      handleInvocation: (method: Method, args: unknown[]): unknown => {
        const keyArgs = context.getKeyArgs(...args);
        const key = this.cacheKeyComputer.computeKey([bucket, ...keyArgs]);
        if (this.cachePolicy.isAlive(key)) {
          const cachedResult = this.cacheStore.get(key);
          if (!cachedResult) {
            throw new InternalServerErrorException();
          }
          return cachedResult;
        }
        const result = method.invoke(args);
        this.cacheStore.put(key, result);
        this.cachePolicy.access(key, ttl);
        return result;
      },
    };

    this.invocationProxy.proxyInvocation(
      context.target,
      context.method,
      invocationHandler,
    );
  }

  public pruneExpired(): void {
    this.cachePolicy.pruneExpired();
  }

  public handleCacheItemExpired(key: string): void {
    this.cacheStore.del(key);
  }
}
