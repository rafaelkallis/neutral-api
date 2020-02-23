import { ValueObject } from 'common/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class StringValueObject<
  T extends StringValueObject<T>
> extends ValueObject<T> {
  public readonly value: string;

  protected constructor(value: string) {
    super();
    this.value = value;
    this.assertString();
  }

  /**
   *
   */
  public equals(other: T): boolean {
    return this.value === other.value;
  }

  /**
   *
   */
  public toString(): string {
    return this.value;
  }

  /**
   *
   */
  protected abstract throwInvalidValueObjectException(): never;

  protected assertString(): void {
    if (typeof this.value !== 'string') {
      this.throwInvalidValueObjectException();
    }
  }

  protected assertMaxLength(maxLength: number): void {
    if (this.value.length > maxLength) {
      this.throwInvalidValueObjectException();
    }
  }

  protected assertMinLength(minLength: number): void {
    if (this.value.length < minLength) {
      this.throwInvalidValueObjectException();
    }
  }
}
