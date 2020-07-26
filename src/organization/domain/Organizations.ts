import { Injectable } from '@nestjs/common';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { UserId } from 'user/domain/value-objects/UserId';
import { AggregateRootFactory } from 'shared/application/AggregateRootFactory';
import { OrganizationName } from './value-objects/OrganizationName';
import { OrganizationId } from './value-objects/OrganizationId';
import { Organization } from './Organization';
import { OrganizationMembershipCollection } from './OrganizationMemberShipCollection';

export interface CreateOrganizationContext {
  readonly name: OrganizationName;
  readonly ownerId: UserId;
}

@Injectable()
export class Organizations extends AggregateRootFactory<
  CreateOrganizationContext,
  OrganizationId,
  Organization
> {
  protected doCreate({
    name,
    ownerId,
  }: CreateOrganizationContext): Organization {
    const organizationId = OrganizationId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const memberships = OrganizationMembershipCollection.empty();
    return Organization.of(
      organizationId,
      createdAt,
      updatedAt,
      name,
      ownerId,
      memberships,
    );
  }
}
