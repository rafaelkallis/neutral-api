import { OnApplicationShutdown } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface CacheItemExpiredHandler {
  handleCacheItemExpired(key: string): void;
}

export abstract class CachePolicy implements OnApplicationShutdown {
  private readonly cacheItemExpired$: Subject<string>;

  public constructor() {
    this.cacheItemExpired$ = new Subject();
  }

  public onApplicationShutdown(): void {
    this.cacheItemExpired$.complete();
  }

  public abstract access(key: string, ttl: number): void;
  public abstract isAlive(key: string): boolean;
  public abstract pruneExpired(): void;

  public registerCacheItemExpiredHandler(
    handler: CacheItemExpiredHandler,
  ): void {
    this.cacheItemExpired$.subscribe((expiredKey) =>
      handler.handleCacheItemExpired(expiredKey),
    );
  }

  protected handleCacheItemExpired(key: string): void {
    this.cacheItemExpired$.next(key);
  }
}
