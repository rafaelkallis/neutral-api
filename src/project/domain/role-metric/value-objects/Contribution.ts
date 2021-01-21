import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export class Contribution extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  public static of(value: number): Contribution {
    return new Contribution(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Contribution)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_contribution',
      'Given contribution is invalid.',
    );
  }
}
