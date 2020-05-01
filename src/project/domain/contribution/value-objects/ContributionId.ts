import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidContributionIdException } from 'project/domain/exceptions/InvalidContributionIdException';

/**
 *
 */
export class ContributionId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static from(id: string): ContributionId {
    return new ContributionId(id);
  }

  public static create(): ContributionId {
    return new ContributionId(Id.createObjectId());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ContributionId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidContributionIdException();
  }
}
