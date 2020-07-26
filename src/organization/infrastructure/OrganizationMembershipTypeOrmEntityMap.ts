import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { UserId } from 'user/domain/value-objects/UserId';
import { Injectable } from '@nestjs/common';
import { OrganizationTypeOrmEntity } from './OrganizationTypeOrmEntity';
import { OrganizationMembershipTypeOrmEntity } from './OrganizationMembershipTypeOrmEntity';
import { OrganizationMembership } from 'organization/domain/OrganizationMembership';
import { OrganizationMembershipId } from 'organization/domain/value-objects/OrganizationMembershipId';

@Injectable()
@ObjectMap.register(OrganizationMembership, OrganizationMembershipTypeOrmEntity)
export class OrganizationMembershipTypeOrmEntityMap extends ObjectMap<
  OrganizationMembership,
  OrganizationMembershipTypeOrmEntity
> {
  protected doMap(
    membership: OrganizationMembership,
    ctx: ObjectMapContext,
  ): OrganizationMembershipTypeOrmEntity {
    return new OrganizationMembershipTypeOrmEntity(
      membership.id.value,
      membership.createdAt.value,
      membership.updatedAt.value,
      ctx.get('organization', OrganizationTypeOrmEntity),
      membership.memberId.value,
    );
  }
}

@Injectable()
@ObjectMap.register(OrganizationMembershipTypeOrmEntity, OrganizationMembership)
export class ReverseOrganizationMembershipTypeOrmEntityMap extends ObjectMap<
  OrganizationMembershipTypeOrmEntity,
  OrganizationMembership
> {
  protected doMap(
    membership: OrganizationMembershipTypeOrmEntity,
  ): OrganizationMembership {
    return OrganizationMembership.of(
      OrganizationMembershipId.of(membership.id),
      CreatedAt.from(membership.createdAt),
      UpdatedAt.from(membership.updatedAt),
      UserId.from(membership.memberId),
    );
  }
}
