export abstract class CacheStore {
  public abstract get<T>(key: string): T | undefined;
  public abstract put<T>(key: string, value: T): void;
  public abstract del(key: string): void;
}
