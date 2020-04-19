/**
 * An abstract registry service implementation.
 */
export abstract class Registry<TKey, TValue> {
  private readonly registry: Map<TKey, TValue>;

  public constructor() {
    this.registry = new Map();
  }

  public set(key: TKey, value: TValue): void {
    this.registry.set(key, value);
  }

  public get(key: TKey): TValue | undefined {
    return this.registry.get(key);
  }

  public has(key: TKey): boolean {
    return this.registry.has(key);
  }
}
