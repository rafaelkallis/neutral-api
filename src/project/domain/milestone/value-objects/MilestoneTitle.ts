import { DomainException } from 'shared/domain/exceptions/DomainException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class MilestoneTitle extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static from(value: string): MilestoneTitle {
    return new MilestoneTitle(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof MilestoneTitle)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_milestone_title',
      'Milestone title is invalid.',
    );
  }
}
