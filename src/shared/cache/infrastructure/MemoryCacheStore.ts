import { CacheStore } from 'shared/cache/application/CacheStore';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryCacheStore extends CacheStore {
  private readonly store: Map<string, unknown>;

  public constructor() {
    super();
    this.store = new Map();
  }

  public get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  public put<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  public del(key: string): void {
    this.store.delete(key);
  }
}
