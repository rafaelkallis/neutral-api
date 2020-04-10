import { CachePolicy } from 'shared/cache/application/CachePolicy';
import LRU from 'lru-cache';

export class LruCachePolicy extends CachePolicy {
  private readonly lru: LRU<string, true>;

  public constructor() {
    super();
    this.lru = new LRU({ dispose: (key) => this.onCacheItemExpired(key) });
  }

  public access(key: string): void {
    this.lru.set(key, true);
  }

  public isAlive(key: string): boolean {
    return Boolean(this.lru.get(key));
  }

  public pruneExpired(): void {
    this.lru.prune();
  }
}
