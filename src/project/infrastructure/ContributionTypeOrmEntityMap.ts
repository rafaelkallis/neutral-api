import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable } from '@nestjs/common';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ContributionTypeOrmEntity } from 'project/infrastructure/ContributionTypeOrmEntity';
import { ContributionId } from 'project/domain/contribution/value-objects/ContributionId';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { Project } from 'project/domain/project/Project';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';

@Injectable()
@ObjectMap.register(Contribution, ContributionTypeOrmEntity)
export class ContributionTypeOrmEntityMap extends ObjectMap<
  Contribution,
  ContributionTypeOrmEntity
> {
  protected doMap(
    contribution: Contribution,
    ctx: ObjectMapContext,
  ): ContributionTypeOrmEntity {
    const project = ctx.get('project', ProjectTypeOrmEntity);
    return new ContributionTypeOrmEntity(
      contribution.id.value,
      contribution.createdAt.value,
      contribution.updatedAt.value,
      project.id,
      contribution.roleId.value,
      contribution.reviewTopicId.value,
      contribution.milestone.id.value,
      contribution.amount.value,
    );
  }
}

@Injectable()
@ObjectMap.register(ContributionTypeOrmEntity, Contribution)
export class ReverseContributionTypeOrmEntityMap extends ObjectMap<
  ContributionTypeOrmEntity,
  Contribution
> {
  protected doMap(
    contribution: ContributionTypeOrmEntity,
    ctx: ObjectMapContext,
  ): Contribution {
    const project = ctx.get('project', Project);
    return new Contribution(
      ContributionId.from(contribution.id),
      CreatedAt.from(contribution.createdAt),
      UpdatedAt.from(contribution.updatedAt),
      project.milestones.whereId(MilestoneId.of(contribution.milestoneId)),
      RoleId.from(contribution.roleId),
      ReviewTopicId.from(contribution.reviewTopicId),
      ContributionAmount.from(contribution.amount),
    );
  }
}
