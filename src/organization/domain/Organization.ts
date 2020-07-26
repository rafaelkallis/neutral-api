import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import {
  AggregateRoot,
  ReadonlyAggregateRoot,
} from 'shared/domain/AggregateRoot';
import { InsufficientPermissionsException } from 'shared/exceptions/insufficient-permissions.exception';
import { UserId } from 'user/domain/value-objects/UserId';
import { Class } from 'shared/domain/Class';
import { OrganizationId } from './value-objects/OrganizationId';
import { OrganizationName } from './value-objects/OrganizationName';

export interface ReadonlyOrganization
  extends ReadonlyAggregateRoot<OrganizationId> {
  readonly name: OrganizationName;
  readonly ownerId: UserId;

  assertOwner(userId: UserId): void;
}

export abstract class Organization extends AggregateRoot<OrganizationId>
  implements ReadonlyOrganization {
  public abstract name: OrganizationName;
  public abstract ownerId: UserId;

  public static of(
    id: OrganizationId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    name: OrganizationName,
    ownerId: UserId,
  ): Organization {
    return new InternalOrganization(id, createdAt, updatedAt, name, ownerId);
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

  public constructor(
    id: OrganizationId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    name: OrganizationName,
    ownerId: UserId,
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.ownerId = ownerId;
  }
}
