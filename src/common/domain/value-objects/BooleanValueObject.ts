import { ValueObject } from 'common/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class BooleanValueObject<
  T extends BooleanValueObject<T>
> extends ValueObject<T> {
  public readonly value: boolean;

  protected constructor(value: boolean) {
    super();
    this.value = value;
    this.assertBoolean();
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
    return this.value.toString();
  }

  /**
   *
   */
  protected abstract throwInvalidValueObjectException(): never;

  protected assertBoolean(): void {
    if (typeof this.value !== 'boolean') {
      this.throwInvalidValueObjectException();
    }
  }
}
