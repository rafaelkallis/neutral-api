import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import {
  AggregateRoot,
  ReadonlyAggregateRoot,
} from 'shared/domain/AggregateRoot';
import { InsufficientPermissionsException } from 'shared/exceptions/insufficient-permissions.exception';
import { UserId } from 'user/domain/value-objects/UserId';
import { Class } from 'shared/domain/Class';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';
import {
  ReadonlyOrganizationMembershipCollection,
  OrganizationMembershipCollection,
} from 'organization/domain/OrganizationMemberShipCollection';

export interface ReadonlyOrganization
  extends ReadonlyAggregateRoot<OrganizationId> {
  readonly name: OrganizationName;
  readonly ownerId: UserId;
  readonly memberships: ReadonlyOrganizationMembershipCollection;

  assertOwner(userId: UserId): void;
}

export abstract class Organization extends AggregateRoot<OrganizationId>
  implements ReadonlyOrganization {
  public abstract name: OrganizationName;
  public abstract ownerId: UserId;
  public abstract memberships: ReadonlyOrganizationMembershipCollection;

  public static of(
    id: OrganizationId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    name: OrganizationName,
    ownerId: UserId,
    memberships: OrganizationMembershipCollection,
  ): Organization {
    return new InternalOrganization(
      id,
      createdAt,
      updatedAt,
      name,
      ownerId,
      memberships,
    );
  }

  public assertOwner(userId: UserId): void {
    if (!this.ownerId.equals(userId)) {
      throw new InsufficientPermissionsException();
    }
  }

  public getClass(): Class<Organization> {
    return Organization;
  }
}

export class InternalOrganization extends Organization {
  public name: OrganizationName;
  public ownerId: UserId;
  public memberships: OrganizationMembershipCollection;

  public constructor(
    id: OrganizationId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    name: OrganizationName,
    ownerId: UserId,
    memberships: OrganizationMembershipCollection,
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.ownerId = ownerId;
    this.memberships = memberships;
  }
}
