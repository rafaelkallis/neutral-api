import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidConsensualityException } from 'project/domain/exceptions/InvalidConsensualityException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export class Consensuality extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  public static from(value: number): Consensuality {
    return new Consensuality(value);
  }

  public isConsensual(): boolean {
    return this.value >= 0.8;
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Consensuality)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidConsensualityException();
  }
}
