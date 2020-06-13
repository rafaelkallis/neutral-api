export interface ReadonlyBiMap<U, V> extends ReadonlyMap<U, V> {
  inverse(): ReadonlyMap<V, U>;
}

export class BiMap<U, V> extends Map<U, V> implements ReadonlyBiMap<U, V> {
  public static empty<U, V>(): BiMap<U, V> {
    return new BiMap([]);
  }

  public inverse(): ReadonlyMap<V, U> {
    const entries = Array.from(this.entries());
    return new Map(
      entries.map(([, v1]) => [
        v1,
        entries.filter(([, v2]) => v1 === v2).map(([u2]) => u2)[0],
      ]),
    );
  }

  public asReadonly(): ReadonlyBiMap<U, V> {
    return this;
  }
}
