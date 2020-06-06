import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable, Type } from '@nestjs/common';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ContributionTypeOrmEntity } from 'project/infrastructure/ContributionTypeOrmEntity';
import { ContributionId } from 'project/domain/contribution/value-objects/ContributionId';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { RoleId } from 'project/domain/role/value-objects/RoleId';

@Injectable()
export class ContributionTypeOrmEntityMap extends ObjectMap<
  Contribution,
  ContributionTypeOrmEntity
> {
  protected doMap(
    contribution: Contribution,
    ctx: ObjectMapContext,
  ): ContributionTypeOrmEntity {
    return new ContributionTypeOrmEntity(
      contribution.id.value,
      contribution.createdAt.value,
      contribution.updatedAt.value,
      ctx.get('project', ProjectTypeOrmEntity),
      contribution.roleId.value,
      contribution.reviewTopicId.value,
      contribution.amount.value,
    );
  }

  public getSourceClass(): Type<Contribution> {
    return Contribution;
  }

  public getTargetClass(): Type<ContributionTypeOrmEntity> {
    return ContributionTypeOrmEntity;
  }
}

@Injectable()
export class ReverseContributionTypeOrmEntityMap extends ObjectMap<
  ContributionTypeOrmEntity,
  Contribution
> {
  protected doMap(contribution: ContributionTypeOrmEntity): Contribution {
    return new Contribution(
      ContributionId.from(contribution.id),
      CreatedAt.from(contribution.createdAt),
      UpdatedAt.from(contribution.updatedAt),
      RoleId.from(contribution.roleId),
      ReviewTopicId.from(contribution.reviewTopicId),
      ContributionAmount.from(contribution.amount),
    );
  }

  public getSourceClass(): Type<ContributionTypeOrmEntity> {
    return ContributionTypeOrmEntity;
  }

  public getTargetClass(): Type<Contribution> {
    return Contribution;
  }
}
