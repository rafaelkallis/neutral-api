import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidContributionAmountException } from 'project/domain/exceptions/InvalidContributionAmountException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class ContributionAmount extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(value: number): ContributionAmount {
    return new ContributionAmount(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ContributionAmount)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidContributionAmountException();
  }
}
