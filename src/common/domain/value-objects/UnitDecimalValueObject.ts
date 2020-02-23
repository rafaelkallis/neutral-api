import { ValueObject } from 'common/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class UnitDecimalValueObject<
  T extends UnitDecimalValueObject<T>
> extends ValueObject<T> {
  public readonly value: number;

  protected constructor(value: number) {
    super();
    if (typeof value !== 'number' || value < 0 || value > 1) {
      this.throwInvalidValueObjectException();
    }
    this.value = value;
  }

  /**
   *
   */
  public equals(other: T): boolean {
    return this.value.toFixed(1000) === other.value.toFixed(1000);
  }

  /**
   *
   */
  public toString(): string {
    return this.value.toFixed(1000);
  }

  /**
   *
   */
  protected abstract throwInvalidValueObjectException(): never;
}
