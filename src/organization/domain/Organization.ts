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
import { ReadonlyUser } from 'user/domain/User';
import {
  OrganizationMembership,
  ReadonlyOrganizationMembership,
} from './OrganizationMembership';
import { OrganizationMembershipId } from './value-objects/OrganizationMembershipId';

export interface ReadonlyOrganization
  extends ReadonlyAggregateRoot<OrganizationId> {
  readonly name: OrganizationName;
  readonly ownerId: UserId;
  readonly memberships: ReadonlyOrganizationMembershipCollection;

  isOwner(userOrId: ReadonlyUser | UserId): boolean;
  assertOwner(userOrId: ReadonlyUser | UserId): void;

  isMember(userOrId: ReadonlyUser | UserId): boolean;
}

export abstract class Organization extends AggregateRoot<OrganizationId>
  implements ReadonlyOrganization {
  public abstract name: OrganizationName;
  public abstract ownerId: UserId;
  public abstract memberships: ReadonlyOrganizationMembershipCollection;

  public static create(context: CreateOrganizationContext): Organization {
    const organizationId = OrganizationId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const memberships = OrganizationMembershipCollection.empty();
    const organization = Organization.of(
      organizationId,
      createdAt,
      updatedAt,
      context.name,
      context.ownerId,
      memberships,
    );
    organization.addMember(context.ownerId);
    return organization;
  }

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

  public abstract addMember(memberId: UserId): ReadonlyOrganizationMembership;

  public isOwner(userOrId: ReadonlyUser | UserId): boolean {
    const id = userOrId instanceof UserId ? userOrId : userOrId.id;
    return this.ownerId.equals(id);
  }

  public assertOwner(userOrId: ReadonlyUser | UserId): void {
    if (!this.isOwner(userOrId)) {
      throw new InsufficientPermissionsException();
    }
  }

  public isMember(userOrId: ReadonlyUser | UserId): boolean {
    return this.memberships.isAnyMember(userOrId);
  }

  public assertMember(userIdOr: ReadonlyUser | UserId): void {
    if (!this.isMember(userIdOr)) {
      throw new InsufficientPermissionsException();
    }
  }

  public getClass(): Class<Organization> {
    return Organization;
  }
}

export interface CreateOrganizationContext {
  readonly name: OrganizationName;
  readonly ownerId: UserId;
}

class InternalOrganization extends Organization {
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

  public addMember(memberId: UserId): ReadonlyOrganizationMembership {
    const membershipId = OrganizationMembershipId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const membership = OrganizationMembership.of(
      membershipId,
      createdAt,
      updatedAt,
      memberId,
    );
    this.memberships.add(membership);
    return membership;
  }
}
