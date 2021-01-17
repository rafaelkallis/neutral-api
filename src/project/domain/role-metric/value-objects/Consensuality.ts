import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export class Consensuality extends UnitDecimalValueObject {
  private static readonly EPSILON = 1e-8;

  private constructor(value: number) {
    super(value);
    this.assertGreaterEqualThanEpsilon(value);
  }

  public static of(value: number): Consensuality {
    if (Math.abs(value) < Consensuality.EPSILON) {
      //console.log("fixing consensuality score by restricting value " + value + " below to a value close to but above 0");
      value = Consensuality.EPSILON;
    }
    return new Consensuality(value);
  }

  private assertGreaterEqualThanEpsilon(value: number): void {
    if (value < Consensuality.EPSILON) {
      this.throwInvalidValueObjectException();
    }
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Consensuality)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_consensuality',
      'Given consensuality is invalid.',
    );
  }
}
