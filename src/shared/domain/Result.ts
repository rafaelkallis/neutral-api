import { DomainError } from 'shared/domain/DomainError';

export abstract class Result<T> {
  public static success<T>(value: T): Result<T> {
    return new SuccessResult<T>(value);
  }

  public static failure<T>(error: DomainError): Result<T> {
    return new FailureResult<T>(error);
  }

  public abstract map<U>(ifSuccess: (value: T) => Result<U>): Result<U>;
  public abstract fold<U>(
    ifSuccess: (value: T) => Result<U>,
    ifFailure: (error: DomainError) => Result<U>,
  ): Result<U>;
  public abstract getOrThrow(): T;
}

export class SuccessResult<T> extends Result<T> {
  public readonly value: T;

  public constructor(value: T) {
    super();
    this.value = value;
  }

  public map<U>(f: (value: T) => Result<U>): Result<U> {
    return f(this.value);
  }

  public fold<U>(
    ifSuccess: (value: T) => Result<U>,
    _ifFailure: (error: DomainError) => Result<U>,
  ): Result<U> {
    return ifSuccess(this.value);
  }

  public getOrThrow(): T {
    return this.value;
  }
}

export class FailureResult<T> extends Result<T> {
  public readonly error: DomainError;

  public constructor(error: DomainError) {
    super();
    this.error = error;
  }

  public map<U>(_ifSuccess: (value: T) => Result<U>): Result<U> {
    return new FailureResult<U>(this.error);
  }

  public fold<U>(
    _ifSuccess: (value: T) => Result<U>,
    ifFailure: (error: DomainError) => Result<U>,
  ): Result<U> {
    return ifFailure(this.error);
  }

  public getOrThrow(): T {
    throw this.error;
  }
}
