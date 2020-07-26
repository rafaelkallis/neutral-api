import { Injectable } from '@nestjs/common';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { Organization } from 'organization/domain/Organization';
import { OrganizationDto } from './OrganizationDto';

@Injectable()
@ObjectMap.register(Organization, OrganizationDto)
export class OrganizationDtoMap extends ObjectMap<
  Organization,
  OrganizationDto
> {
  protected doMap(organization: Organization): OrganizationDto {
    return new OrganizationDto(
      organization.id.value,
      organization.createdAt.value,
      organization.updatedAt.value,
      organization.name.value,
      organization.ownerId.value,
    );
  }
}
