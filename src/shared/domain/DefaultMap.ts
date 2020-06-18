export interface ReadonlyDefaultMap<U, V> extends ReadonlyMap<U, V> {
  get(u: U): V;
}

export class DefaultMap<U, V> extends Map<U, V> {
  private readonly defaultValue: (u: U) => V;

  public constructor(iterable: Iterable<[U, V]>, defaultValue: (u: U) => V) {
    super(iterable);
    this.defaultValue = defaultValue;
  }

  public static empty<U, V>(defaultValue: (u: U) => V): DefaultMap<U, V> {
    return new DefaultMap([], defaultValue);
  }

  public get(u: U): V {
    let v = super.get(u);
    if (!v) {
      v = this.defaultValue(u);
      this.set(u, v);
    }
    return v;
  }

  public has(_u: U): boolean {
    return true;
  }

  public asReadonly(): ReadonlyDefaultMap<U, V> {
    return this;
  }
}
