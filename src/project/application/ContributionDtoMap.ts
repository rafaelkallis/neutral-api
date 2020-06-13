import { Injectable } from '@nestjs/common';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ContributionDto } from 'project/application/dto/ContributionDto';

@Injectable()
@ObjectMap.mapFromTo(Contribution, ContributionDto)
export class ContributionDtoMap extends ObjectMap<
  Contribution,
  ContributionDto
> {
  protected doMap(contribution: Contribution): ContributionDto {
    return new ContributionDto(
      contribution.id.value,
      contribution.createdAt.value,
      contribution.updatedAt.value,
      contribution.roleId.value,
      contribution.reviewTopicId.value,
      contribution.amount.value,
    );
  }
}
