import { Injectable } from '@nestjs/common';
import { CachePolicy } from 'shared/cache/application/CachePolicy';
import LRU from 'lru-cache';

@Injectable()
export class LruCachePolicy extends CachePolicy {
  private readonly lru: LRU<string, true>;

  public constructor() {
    super();
    this.lru = new LRU({
      dispose: (key): void => this.handleCacheItemExpired(key),
    });
  }

  public access(key: string, ttl: number): void {
    this.lru.set(key, true, ttl);
  }

  public isAlive(key: string): boolean {
    return Boolean(this.lru.get(key));
  }

  public pruneExpired(): void {
    this.lru.prune();
  }
}
