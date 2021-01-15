import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

/**
 *
 */
export class MilestoneDescription extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 1024);
  }

  /**
   *
   */
  public static from(value: string): MilestoneDescription {
    return new MilestoneDescription(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof MilestoneDescription)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_milestone_decription',
      'Milestone description is invalid.',
    );
  }
}
