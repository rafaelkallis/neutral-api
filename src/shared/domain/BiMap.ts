export interface ReadonlyBiMap<U, V> extends ReadonlyMap<U, V> {
  inverse(): ReadonlyMap<V, U>;
}

export class BiMap<U, V> extends Map<U, V> implements ReadonlyBiMap<U, V> {
  public static empty<U, V>(): BiMap<U, V> {
    return new BiMap([]);
  }

  public inverse(): ReadonlyMap<V, U> {
    return new Map(Array.from(this.entries()).map(([u, v]) => [v, u]));
  }

  public asReadonly(): ReadonlyBiMap<U, V> {
    return this;
  }
}
