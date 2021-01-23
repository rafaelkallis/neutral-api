import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

/**
 *
 */
export class MilestoneMetricId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static of(id: string): MilestoneMetricId {
    return new MilestoneMetricId(id);
  }

  public static create(): MilestoneMetricId {
    return new MilestoneMetricId(Id.createInner());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof MilestoneMetricId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_milestone_metric_id',
      'Given milestoneMetricId is invalid.',
    );
  }
}
