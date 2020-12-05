import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

/**
 *
 */
export class MilestoneId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static of(id: string): MilestoneId {
    return new MilestoneId(id);
  }

  public static create(): MilestoneId {
    return new MilestoneId(Id.createInner());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof MilestoneId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_milestone_id',
      'Given milestoneId is invalid.',
    );
  }
}
