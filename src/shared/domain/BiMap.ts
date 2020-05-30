export interface ReadonlyBiMap<T, U> {
  get(t: T): U | null;
  getReverse(u: U): T | null;
}

export class BiMap<T, U> implements ReadonlyBiMap<T, U> {
  private readonly values: [T, U][];

  public constructor() {
    this.values = [];
  }

  public get(t1: T): U | null {
    for (const [t2, u2] of this.values) {
      if (t1 === t2) {
        return u2;
      }
    }
    return null;
  }

  public getReverse(u1: U): T | null {
    for (const [t2, u2] of this.values) {
      if (u1 === u2) {
        return t2;
      }
    }
    return null;
  }

  public put(t1: T, u1: U): void {
    for (const [t2, u2] of this.values) {
      if (t1 === t2 || u1 === u2) {
        throw new Error(`Conflicting pairs: {${t1}, ${u1}} and {${t2}, ${u2}}`);
      }
    }
    this.values.push([t1, u1]);
  }
}
