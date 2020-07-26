import { Model, ReadonlyModel } from 'shared/domain/Model';
import { ReadonlyUser } from 'user/domain/User';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { UserId } from 'user/domain/value-objects/UserId';
import { Class } from 'shared/domain/Class';
import { OrganizationMembershipId } from 'organization/domain/value-objects/OrganizationMembershipId';

export interface ReadonlyOrganizationMembership
  extends ReadonlyModel<OrganizationMembershipId> {
  readonly memberId: UserId;

  isMember(userOrId: ReadonlyUser | UserId): boolean;
}

export class OrganizationMembership extends Model<OrganizationMembershipId>
  implements ReadonlyOrganizationMembership {
  public memberId: UserId;

  public static of(
    membershipId: OrganizationMembershipId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    memberId: UserId,
  ): OrganizationMembership {
    return new OrganizationMembership(
      membershipId,
      createdAt,
      updatedAt,
      memberId,
    );
  }

  public isMember(userOrId: ReadonlyUser | UserId): boolean {
    const userId = userOrId instanceof UserId ? userOrId : userOrId.id;
    return this.memberId ? this.memberId.equals(userId) : false;
  }

  public getClass(): Class<OrganizationMembership> {
    return OrganizationMembership;
  }

  private constructor(
    id: OrganizationMembershipId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    memberId: UserId,
  ) {
    super(id, createdAt, updatedAt);
    this.memberId = memberId;
  }
}
