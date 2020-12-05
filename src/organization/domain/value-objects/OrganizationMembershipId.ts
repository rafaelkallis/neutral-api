import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export class OrganizationMembershipId extends Id {
  public static of(id: string): OrganizationMembershipId {
    return new OrganizationMembershipId(id);
  }

  public static create(): OrganizationMembershipId {
    return new OrganizationMembershipId(Id.createInner());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof OrganizationMembershipId)) {
      return false;
    }
    return super.equals(other);
  }

  private constructor(value: string) {
    super(value);
  }
}
