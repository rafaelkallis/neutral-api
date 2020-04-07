import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';
import { InvalidUnitDecimalException } from 'shared/domain/exceptions/InvalidUnitDecimalException';

/**
 *
 */
export abstract class UnitDecimalValueObject<
  T extends UnitDecimalValueObject<T>
> extends NumberValueObject<T> {
  protected constructor(value: number) {
    super(value);
    this.assertUnitDecimal(value);
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

  private assertUnitDecimal(value: number): void {
    if (value < 0 || value > 1) {
      this.throwInvalidValueObjectException();
    }
  }

  /**
   *
   */
  protected throwInvalidValueObjectException(): never {
    throw new InvalidUnitDecimalException();
  }
}
