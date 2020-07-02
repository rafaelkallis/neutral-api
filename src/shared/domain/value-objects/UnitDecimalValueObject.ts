import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';
import { InvalidUnitDecimalException } from 'shared/domain/exceptions/InvalidUnitDecimalException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export abstract class UnitDecimalValueObject extends NumberValueObject {
  protected constructor(value: number) {
    super(value);
    this.assertUnitDecimal(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof UnitDecimalValueObject)) {
      return false;
    }
    // TODO: not sure if chain of command makes sense here
    if (this.value.toFixed(3) === other.value.toFixed(3)) {
      return true;
    }
    return super.equals(other);
  }

  public toString(): string {
    return this.value.toFixed(3);
  }

  private assertUnitDecimal(value: number): void {
    if (value < 0) {
      this.throwInvalidValueObjectException();
    }
    if (value > 1) {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidUnitDecimalException();
  }
}
