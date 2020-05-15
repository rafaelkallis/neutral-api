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
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';

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

  public getSourceType(): Type<Contribution> {
    return Contribution;
  }

  public getTargetType(): Type<ContributionTypeOrmEntity> {
    return ContributionTypeOrmEntity;
  }
}

@Injectable()
export class ReverseContributionTypeOrmEntityMap extends ObjectMap<
  ContributionTypeOrmEntity,
  Contribution
> {
  protected doMap(
    contribution: ContributionTypeOrmEntity,
    context: ObjectMapContext,
  ): Contribution {
    return new Contribution(
      context.get('unitOfWork', UnitOfWork),
      ContributionId.from(contribution.id),
      CreatedAt.from(contribution.createdAt),
      UpdatedAt.from(contribution.updatedAt),
      RoleId.from(contribution.roleId),
      ReviewTopicId.from(contribution.reviewTopicId),
      ContributionAmount.from(contribution.amount),
    );
  }

  public getSourceType(): Type<ContributionTypeOrmEntity> {
    return ContributionTypeOrmEntity;
  }

  public getTargetType(): Type<Contribution> {
    return Contribution;
  }
}
