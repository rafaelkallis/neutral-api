export interface ReadonlyInversableMap<U, V> extends ReadonlyMap<U, V> {
  inverse(): ReadonlyMap<V, U[]>;
  inverseDistinct(): ReadonlyMap<V, U>;
}

export class InversableMap<U, V> extends Map<U, V>
  implements ReadonlyInversableMap<U, V> {
  public static of<U, V>(values: [U, V][]): InversableMap<U, V> {
    return new InversableMap(values);
  }

  public static empty<U, V>(): InversableMap<U, V> {
    return new InversableMap();
  }

  public inverse(): ReadonlyMap<V, U[]> {
    const entries = Array.from(this.entries());
    return new Map(
      entries.map(([, v1]) => [
        v1,
        entries.filter(([, v2]) => v1 === v2).map(([u2]) => u2),
      ]),
    );
  }

  public inverseDistinct(): ReadonlyMap<V, U> {
    const entries = Array.from(this.entries());
    return new Map(entries.map(([u, v]) => [v, u]));
  }

  public toReadonly(): ReadonlyInversableMap<U, V> {
    return this;
  }
}
