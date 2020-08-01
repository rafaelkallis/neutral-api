import { Injectable } from '@nestjs/common';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { OrganizationMembership } from 'organization/domain/OrganizationMembership';
import { OrganizationMembershipDto } from './OrganizationMembershipDto';

@Injectable()
@ObjectMap.register(OrganizationMembership, OrganizationMembershipDto)
export class OrganizationMembershipDtoMap extends ObjectMap<
  OrganizationMembership,
  OrganizationMembershipDto
> {
  protected doMap(
    membership: OrganizationMembership,
  ): OrganizationMembershipDto {
    return new OrganizationMembershipDto(
      membership.id.value,
      membership.createdAt.value,
      membership.updatedAt.value,
      membership.memberId.value,
    );
  }
}
