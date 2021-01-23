import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export class Agreement extends UnitDecimalValueObject {
  private static readonly EPSILON = 1e-8;

  private constructor(value: number) {
    super(value);
    this.assertGreaterEqualThanEpsilon(value);
  }

  public static of(value: number): Agreement {
    if (Math.abs(value) < Agreement.EPSILON) {
      //console.log("fixing consensuality score by restricting value " + value + " below to a value close to but above 0");
      value = Agreement.EPSILON;
    }
    return new Agreement(value);
  }

  private assertGreaterEqualThanEpsilon(value: number): void {
    if (value < Agreement.EPSILON) {
      this.throwInvalidValueObjectException();
    }
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Agreement)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_agreement',
      'Given agreement is invalid.',
    );
  }
}
