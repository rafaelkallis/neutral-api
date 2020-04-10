import { OnModuleInit } from '@nestjs/common';
import { Optional } from 'shared/domain/Optional';
import { CacheStore } from 'shared/cache/application/CacheStore';
import {
  CachePolicy,
  CacheItemExpiredHandler,
} from 'shared/cache/application/CachePolicy';

/**
 * Cache Client, a cache facade.
 */
export class CacheClient implements OnModuleInit, CacheItemExpiredHandler {
  private readonly cachePolicy: CachePolicy;
  private readonly cacheStore: CacheStore;

  public constructor(cachePolicy: CachePolicy, cacheStore: CacheStore) {
    this.cachePolicy = cachePolicy;
    this.cacheStore = cacheStore;
  }

  public onModuleInit(): void {
    this.cachePolicy.registerCacheItemExpiredHandler(this);
  }

  public get<T>(storeKey: string, entryKey: string): Optional<T> {
    const key = this.computeKey(storeKey, entryKey);
    const isAlive = this.cachePolicy.isAlive(key);
    if (!isAlive) {
      return Optional.empty();
    }
    return this.cacheStore.get<T>(key); // must exist in the store
  }

  public put<T>(storeKey: string, entryKey: string, value: T): void {
    const key = this.computeKey(storeKey, entryKey);
    this.cachePolicy.access(key);
    this.cacheStore.put<T>(key, value);
  }

  public pruneExpired(): void {
    this.cachePolicy.pruneExpired();
  }

  public handleCacheItemExpired(key: string): void {
    this.cacheStore.del(key);
  }

  private computeKey(storeKey: string, entryKey: string): string {
    return storeKey + entryKey;
  }
}
