import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export class ContributionSymmetry extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  public static of(value: number): ContributionSymmetry {
    return new ContributionSymmetry(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ContributionSymmetry)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_contribution_symmetry',
      'Given contribution symmetry is invalid.',
    );
  }
}
