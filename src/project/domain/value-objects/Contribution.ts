import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidContributionException } from 'project/domain/exceptions/InvalidContributionException';

/**
 *
 */
export class Contribution extends UnitDecimalValueObject<Contribution> {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(value: number): Contribution {
    return new Contribution(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidContributionException();
  }
}
