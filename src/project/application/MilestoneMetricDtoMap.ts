import { Injectable } from '@nestjs/common';
import { MilestoneMetric } from 'project/domain/milestone-metric/MilestoneMetric';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { MilestoneMetricDto } from './dto/MilestoneMetricDto';

@Injectable()
@ObjectMap.register(MilestoneMetric, MilestoneMetricDto)
export class MilestoneMetricDtoMap extends ObjectMap<
  MilestoneMetric,
  MilestoneMetricDto
> {
  protected doMap(milestoneMetric: MilestoneMetric): MilestoneMetricDto {
    return new MilestoneMetricDto(
      milestoneMetric.id.value,
      milestoneMetric.createdAt.value,
      milestoneMetric.updatedAt.value,
      milestoneMetric.milestoneId.value,
      milestoneMetric.reviewTopicId.value,
      milestoneMetric.contributionSymmetry.value,
      milestoneMetric.consensuality.value,
      milestoneMetric.agreement.value,
    );
  }
}
