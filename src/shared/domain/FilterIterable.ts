export class FilterIterable<T> implements Iterable<T> {
  private readonly innerIterable: Iterable<T>;
  private readonly predicate: (x: T) => boolean;

  public constructor(innerIterable: Iterable<T>, predicate: (x: T) => boolean) {
    this.innerIterable = innerIterable;
    this.predicate = predicate;
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const x of this.innerIterable) {
      if (this.predicate(x)) {
        yield x;
      }
    }
  }
}
