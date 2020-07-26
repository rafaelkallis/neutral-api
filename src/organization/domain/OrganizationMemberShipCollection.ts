import { ReadonlyUser } from 'user/domain/User';
import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { UserId } from 'user/domain/value-objects/UserId';
import { OrganizationMembershipId } from './value-objects/OrganizationMembershipId';
import {
  ReadonlyOrganizationMembership,
  OrganizationMembership,
} from './OrganizationMembership';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export interface ReadonlyOrganizationMembershipCollection
  extends ReadonlyModelCollection<
    OrganizationMembershipId,
    ReadonlyOrganizationMembership
  > {
  isAnyMember(userOrId: ReadonlyUser | UserId): boolean;
  whereMember(userOrId: ReadonlyUser | UserId): ReadonlyOrganizationMembership;
}

export class OrganizationMembershipCollection
  extends ModelCollection<OrganizationMembershipId, OrganizationMembership>
  implements ReadonlyOrganizationMembershipCollection {
  public static empty(): OrganizationMembershipCollection {
    return new OrganizationMembershipCollection([]);
  }

  public isAnyMember(userOrId: ReadonlyUser | UserId): boolean {
    return this.isAny((membership) => membership.isMember(userOrId));
  }

  public whereMember(
    userOrId: ReadonlyUser | UserId,
  ): ReadonlyOrganizationMembership {
    const membershipOrNull = this.filter((membership) =>
      membership.isMember(userOrId),
    ).firstOrNull();
    if (!membershipOrNull) {
      throw new DomainException(
        'organization_membership_not_found',
        'Could not find organization membership',
      );
    }
    return membershipOrNull;
  }

  protected filter(
    predicate: (membership: ReadonlyOrganizationMembership) => boolean,
  ): ReadonlyOrganizationMembershipCollection {
    return new OrganizationMembershipCollection(
      this.toArray().filter(predicate),
    );
  }

  protected assertCanAdd(membershipToAdd: OrganizationMembership): void {
    if (this.isAnyMember(membershipToAdd.memberId)) {
      throw new DomainException(
        'organization_membership_member_already_exists',
        'An organization membership with the same member already exists',
      );
    }
    super.assertCanAdd(membershipToAdd);
  }
}
