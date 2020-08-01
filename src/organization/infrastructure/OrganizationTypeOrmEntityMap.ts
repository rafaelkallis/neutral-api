import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { UserId } from 'user/domain/value-objects/UserId';
import { Injectable } from '@nestjs/common';
import { Organization } from 'organization/domain/Organization';
import { OrganizationTypeOrmEntity } from './OrganizationTypeOrmEntity';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';
import { OrganizationMembershipTypeOrmEntity } from './OrganizationMembershipTypeOrmEntity';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { OrganizationMembershipCollection } from 'organization/domain/OrganizationMemberShipCollection';
import { OrganizationMembership } from 'organization/domain/OrganizationMembership';

@Injectable()
@ObjectMap.register(Organization, OrganizationTypeOrmEntity)
export class OrganizationTypeOrmEntityMap extends ObjectMap<
  Organization,
  OrganizationTypeOrmEntity
> {
  public static readonly MEMBERSHIPS_SENTINEL: ReadonlyArray<
    OrganizationMembershipTypeOrmEntity
  > = [];

  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected async doMap(
    organization: Organization,
  ): Promise<OrganizationTypeOrmEntity> {
    const organizationEntity = new OrganizationTypeOrmEntity(
      organization.id.value,
      organization.createdAt.value,
      organization.updatedAt.value,
      organization.name.value,
      organization.ownerId.value,
      OrganizationTypeOrmEntityMap.MEMBERSHIPS_SENTINEL,
    );
    organizationEntity.memberships = await this.objectMapper.mapIterable(
      organization.memberships.toArray(),
      OrganizationMembershipTypeOrmEntity,
      { organization: organizationEntity },
    );
    return organizationEntity;
  }
}

@Injectable()
@ObjectMap.register(OrganizationTypeOrmEntity, Organization)
export class ReverseOrganizationTypeOrmEntityMap extends ObjectMap<
  OrganizationTypeOrmEntity,
  Organization
> {
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected async doMap(
    organization: OrganizationTypeOrmEntity,
  ): Promise<Organization> {
    const memberships = new OrganizationMembershipCollection(
      await this.objectMapper.mapIterable(
        organization.memberships,
        OrganizationMembership,
      ),
    );
    return Organization.of(
      OrganizationId.of(organization.id),
      CreatedAt.from(organization.createdAt),
      UpdatedAt.from(organization.updatedAt),
      OrganizationName.of(organization.name),
      UserId.from(organization.ownerId),
      memberships,
    );
  }
}
