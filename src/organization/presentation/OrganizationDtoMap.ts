import { Injectable } from '@nestjs/common';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { Organization } from 'organization/domain/Organization';
import { OrganizationDto } from './OrganizationDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { OrganizationMembershipDto } from './OrganizationMembershipDto';

@Injectable()
@ObjectMap.register(Organization, OrganizationDto)
export class OrganizationDtoMap extends ObjectMap<
  Organization,
  OrganizationDto
> {
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected async doMap(organization: Organization): Promise<OrganizationDto> {
    return new OrganizationDto(
      organization.id.value,
      organization.createdAt.value,
      organization.updatedAt.value,
      organization.name.value,
      organization.ownerId.value,
      await this.objectMapper.mapIterable(
        organization.memberships,
        OrganizationMembershipDto,
      ),
    );
  }
}
