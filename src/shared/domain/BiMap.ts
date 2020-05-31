/**
 * A bimap (or "bidirectional map") is a map that preserves the uniqueness of its values as well as that of its keys.
 */
export interface ReadonlyBiMap<U, V> {
  get(t: U): V | null;
  inverse(): ReadonlyBiMap<V, U>;
}

export class BiMap<U, V> implements ReadonlyBiMap<U, V> {
  private readonly values: [U, V][];

  private constructor(values: [U, V][]) {
    this.values = values;
  }

  public static empty<U, V>(): BiMap<U, V> {
    return new BiMap([]);
  }

  public get(u1: U): V | null {
    for (const [u2, v2] of this.values) {
      if (u1 === u2) {
        return v2;
      }
    }
    return null;
  }

  public inverse(): ReadonlyBiMap<V, U> {
    return new BiMap(this.values.map(([u, v]) => [v, u]));
  }

  public put(u1: U, v1: V): void {
    for (const [u2, v2] of this.values) {
      if (u1 === u2 || v1 === v2) {
        throw new Error(`Conflicting pairs: {${u1}, ${v1}} and {${u2}, ${v2}}`);
      }
    }
    this.values.push([u1, v1]);
  }
}
