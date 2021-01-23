import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

/**
 *
 */
export class RoleMetricId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static of(id: string): RoleMetricId {
    return new RoleMetricId(id);
  }

  public static create(): RoleMetricId {
    return new RoleMetricId(Id.createInner());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof RoleMetricId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new DomainException(
      'invalid_role_metric_id',
      'Given roleMetricId is invalid.',
    );
  }
}
