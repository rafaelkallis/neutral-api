export abstract class Either<U, V> {
  public static left<U, V>(value: U): Either<U, V> {
    return new Left<U, V>(value);
  }

  public static right<U, V>(value: V): Either<U, V> {
    return new Right<U, V>(value);
  }

  public abstract fold<T>(ifLeft: (value: U) => T, ifRight: (value: V) => T): T;
}

export class Left<U, V> extends Either<U, V> {
  public readonly value: U;

  public constructor(value: U) {
    super();
    this.value = value;
  }

  public fold<T>(ifLeft: (value: U) => T, _ifRight: (value: V) => T): T {
    return ifLeft(this.value);
  }
}

export class Right<U, V> extends Either<U, V> {
  public readonly value: V;

  public constructor(value: V) {
    super();
    this.value = value;
  }

  public fold<T>(_ifLeft: (value: U) => T, ifRight: (value: V) => T): T {
    return ifRight(this.value);
  }
}
