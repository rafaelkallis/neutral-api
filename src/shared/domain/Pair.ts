const pairFlyweights: Pair<unknown, unknown>[] = [];

export class Pair<T1, T2> implements Iterable<T1 | T2> {
  private readonly t1: T1;
  private readonly t2: T2;

  public static of<T1, T2>(t1: T1, t2: T2): Pair<T1, T2> {
    let pair = pairFlyweights.find(
      ([ot1, ot2]) => t1 === ot1 && t2 === ot2,
    ) as Pair<T1, T2>;
    if (!pair) {
      pair = new Pair(t1, t2);
      pairFlyweights.push(pair);
    }
    return pair;
  }

  public *[Symbol.iterator](): Iterator<T1 | T2> {
    yield this.t1;
    yield this.t2;
  }

  private constructor(t1: T1, t2: T2) {
    this.t1 = t1;
    this.t2 = t2;
  }
}
