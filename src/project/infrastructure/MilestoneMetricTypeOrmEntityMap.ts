import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable } from '@nestjs/common';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Project } from 'project/domain/project/Project';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { Agreement } from 'project/domain/value-objects/Agreement';
import { MilestoneMetric } from 'project/domain/milestone-metric/MilestoneMetric';
import { MilestoneMetricTypeOrmEntity } from './MilestoneMetricTypeOrmEntity';
import { MilestoneMetricId } from 'project/domain/milestone-metric/MilestoneMetricId';
import { ContributionSymmetry } from 'project/domain/value-objects/ContributionSymmetry';

@Injectable()
@ObjectMap.register(MilestoneMetric, MilestoneMetricTypeOrmEntity)
export class MilestoneMetricTypeOrmEntityMap extends ObjectMap<
  MilestoneMetric,
  MilestoneMetricTypeOrmEntity
> {
  protected doMap(
    milestoneMetric: MilestoneMetric,
  ): MilestoneMetricTypeOrmEntity {
    return new MilestoneMetricTypeOrmEntity(
      milestoneMetric.id.value,
      milestoneMetric.createdAt.value,
      milestoneMetric.updatedAt.value,
      milestoneMetric.project.id.value,
      milestoneMetric.milestoneId.value,
      milestoneMetric.reviewTopicId.value,
      milestoneMetric.contributionSymmetry.value,
      milestoneMetric.consensuality.value,
      milestoneMetric.agreement.value,
    );
  }
}

@Injectable()
@ObjectMap.register(MilestoneMetricTypeOrmEntity, MilestoneMetric)
export class ReverseMilestoneMetricTypeOrmEntityMap extends ObjectMap<
  MilestoneMetricTypeOrmEntity,
  MilestoneMetric
> {
  protected doMap(
    milestoneMetric: MilestoneMetricTypeOrmEntity,
    ctx: ObjectMapContext,
  ): MilestoneMetric {
    const project = ctx.get('project', Project);
    return new MilestoneMetric(
      MilestoneMetricId.of(milestoneMetric.id),
      CreatedAt.from(milestoneMetric.createdAt),
      UpdatedAt.from(milestoneMetric.updatedAt),
      project,
      ReviewTopicId.from(milestoneMetric.reviewTopicId),
      MilestoneId.of(milestoneMetric.milestoneId),
      ContributionSymmetry.of(milestoneMetric.contributionSymmetry),
      Consensuality.of(milestoneMetric.consensuality),
      Agreement.of(milestoneMetric.agreement),
    );
  }
}
