import { Exception } from 'shared/domain/exceptions/Exception';
import { DomainException } from './exceptions/DomainException';

export abstract class Result<T> {
  public static success<T>(value: T): Result<T> {
    return new SuccessResult<T>(value);
  }

  public static failure<T>(exception: Exception): Result<T> {
    return new FailureResult<T>(exception);
  }

  public abstract map<U>(ifSuccess: (value: T) => Result<U>): Result<U>;
  public abstract fold<U>(
    ifSuccess: (value: T) => Result<U>,
    ifFailure: (exception: Exception) => Result<U>,
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
    _ifFailure: (exception: DomainException) => Result<U>,
  ): Result<U> {
    return ifSuccess(this.value);
  }

  public getOrThrow(): T {
    return this.value;
  }
}

export class FailureResult<T> extends Result<T> {
  public readonly exception: DomainException;

  public constructor(exception: DomainException) {
    super();
    this.exception = exception;
  }

  public map<U>(_ifSuccess: (value: T) => Result<U>): Result<U> {
    return new FailureResult<U>(this.exception);
  }

  public fold<U>(
    _ifSuccess: (value: T) => Result<U>,
    ifFailure: (exception: DomainException) => Result<U>,
  ): Result<U> {
    return ifFailure(this.exception);
  }

  public getOrThrow(): T {
    throw this.exception;
  }
}
