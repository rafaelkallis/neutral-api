import { Type } from '@nestjs/common';

export class Optional<T> {
  public value: T | null | undefined;

  private constructor(value: T | null | undefined) {
    this.value = value;
  }

  public static of<T>(value: T | null | undefined): Optional<T> {
    return new Optional(value);
  }

  public static empty<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  public isPresent(): boolean {
    return Boolean(this.value);
  }

  public orElse(other: T): T {
    return this.value || other;
  }

  public orElseThrow(errorType: Type<Error>): T {
    if (!this.value) {
      throw new errorType();
    }
    return this.value;
  }

  public map<U>(mapping: (value: T) => U): Optional<U> {
    if (!this.value) {
      return Optional.empty();
    }
    return Optional.of(mapping(this.value));
  }
}
