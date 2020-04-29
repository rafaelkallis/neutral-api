import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidContributionException } from 'project/domain/exceptions/InvalidContributionException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class Contribution extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(value: number): Contribution {
    return new Contribution(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Contribution)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidContributionException();
  }
}
