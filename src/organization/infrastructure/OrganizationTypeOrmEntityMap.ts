import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { UserId } from 'user/domain/value-objects/UserId';
import { Injectable } from '@nestjs/common';
import { Organization } from 'organization/domain/Organization';
import { OrganizationTypeOrmEntity } from './OrganizationTypeOrmEntity';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';

@Injectable()
@ObjectMap.register(Organization, OrganizationTypeOrmEntity)
export class OrganizationTypeOrmEntityMap extends ObjectMap<
  Organization,
  OrganizationTypeOrmEntity
> {
  protected doMap(organization: Organization): OrganizationTypeOrmEntity {
    return new OrganizationTypeOrmEntity(
      organization.id.value,
      organization.createdAt.value,
      organization.updatedAt.value,
      organization.name.value,
      organization.ownerId.value,
    );
  }
}

@Injectable()
@ObjectMap.register(OrganizationTypeOrmEntity, Organization)
export class ReverseOrganizationTypeOrmEntityMap extends ObjectMap<
  OrganizationTypeOrmEntity,
  Organization
> {
  protected doMap(organization: OrganizationTypeOrmEntity): Organization {
    return Organization.of(
      OrganizationId.of(organization.id),
      CreatedAt.from(organization.createdAt),
      UpdatedAt.from(organization.updatedAt),
      OrganizationName.of(organization.name),
      UserId.from(organization.ownerId),
    );
  }
}
