import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';
import { InvalidUnitDecimalException } from 'shared/domain/exceptions/InvalidUnitDecimalException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class UnitDecimalValueObject extends NumberValueObject {
  protected constructor(value: number) {
    super(value);
    this.assertUnitDecimal(value);
  }

  /**
   *
   */
  public equals(other: ValueObject): boolean {
    if (!(other instanceof UnitDecimalValueObject)) {
      return false;
    }
    // TODO: not sure if chain of command makes sense here
    if (this.value.toFixed(1000) === other.value.toFixed(1000)) {
      return true;
    }
    return super.equals(other);
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
