import { CacheStore } from 'shared/cache/application/CacheStore';
import { Optional } from 'shared/domain/Optional';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryCacheStore extends CacheStore {
  private readonly store: Map<string, unknown>;

  public constructor() {
    super();
    this.store = new Map();
  }

  public get<T>(key: string): Optional<T> {
    const valueOrUndefined = this.store.get(key) as T | undefined;
    return Optional.of(valueOrUndefined);
  }

  public put<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  public del(key: string): void {
    this.store.delete(key);
  }
}
