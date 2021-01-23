import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable } from '@nestjs/common';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Project } from 'project/domain/project/Project';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { RoleMetricTypeOrmEntity } from './RoleMetricTypeOrmEntity';
import { RoleMetricId } from 'project/domain/role-metric/RoleMetricId';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { Agreement } from 'project/domain/value-objects/Agreement';

@Injectable()
@ObjectMap.register(RoleMetric, RoleMetricTypeOrmEntity)
export class RoleMetricTypeOrmEntityMap extends ObjectMap<
  RoleMetric,
  RoleMetricTypeOrmEntity
> {
  protected doMap(roleMetric: RoleMetric): RoleMetricTypeOrmEntity {
    return new RoleMetricTypeOrmEntity(
      roleMetric.id.value,
      roleMetric.createdAt.value,
      roleMetric.updatedAt.value,
      roleMetric.project.id.value,
      roleMetric.milestoneId.value,
      roleMetric.reviewTopicId.value,
      roleMetric.roleId.value,
      roleMetric.contribution.value,
      roleMetric.consensuality.value,
      roleMetric.agreement.value,
    );
  }
}

@Injectable()
@ObjectMap.register(RoleMetricTypeOrmEntity, RoleMetric)
export class ReverseRoleMetricTypeOrmEntityMap extends ObjectMap<
  RoleMetricTypeOrmEntity,
  RoleMetric
> {
  protected doMap(
    roleMetric: RoleMetricTypeOrmEntity,
    ctx: ObjectMapContext,
  ): RoleMetric {
    const project = ctx.get('project', Project);
    return new RoleMetric(
      RoleMetricId.of(roleMetric.id),
      CreatedAt.from(roleMetric.createdAt),
      UpdatedAt.from(roleMetric.updatedAt),
      project,
      RoleId.from(roleMetric.roleId),
      ReviewTopicId.from(roleMetric.reviewTopicId),
      MilestoneId.of(roleMetric.milestoneId),
      Contribution.of(roleMetric.contribution),
      Consensuality.of(roleMetric.consensuality),
      Agreement.of(roleMetric.agreement),
    );
  }
}
