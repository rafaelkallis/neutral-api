import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export class OrganizationId extends Id {
  public static of(id: string): OrganizationId {
    return new OrganizationId(id);
  }

  public static create(): OrganizationId {
    return new OrganizationId(Id.createObjectId());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof OrganizationId)) {
      return false;
    }
    return super.equals(other);
  }

  private constructor(value: string) {
    super(value);
  }
}
