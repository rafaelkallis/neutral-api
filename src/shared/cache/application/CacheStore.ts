import { Optional } from 'shared/domain/Optional';

export abstract class CacheStore {
  public abstract get<T>(key: string): Optional<T>;
  public abstract put<T>(key: string, value: T): void;
  public abstract del(key: string): void;
}
