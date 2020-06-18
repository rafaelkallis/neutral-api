import { OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export abstract class CachePolicy implements OnModuleDestroy {
  protected readonly cacheItemExpiredSubject: Subject<string>;
  public get cacheItemExpired$(): Observable<string> {
    return this.cacheItemExpiredSubject.asObservable();
  }

  public constructor() {
    this.cacheItemExpiredSubject = new Subject();
  }

  public onModuleDestroy(): void {
    this.cacheItemExpiredSubject.complete();
  }

  public abstract access(key: string, ttl: number): void;
  public abstract isAlive(key: string): boolean;
  public abstract pruneExpired(): void;
}
