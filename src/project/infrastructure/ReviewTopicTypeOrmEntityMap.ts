import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable, Type } from '@nestjs/common';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';

@Injectable()
export class ReviewTopicTypeOrmEntityMap extends ObjectMap<
  ReviewTopic,
  ReviewTopicTypeOrmEntity
> {
  protected doMap(
    reviewTopicModel: ReviewTopic,
    ctx: ObjectMapContext,
  ): ReviewTopicTypeOrmEntity {
    return new ReviewTopicTypeOrmEntity(
      reviewTopicModel.id.value,
      reviewTopicModel.createdAt.value,
      reviewTopicModel.updatedAt.value,
      ctx.get('project', ProjectTypeOrmEntity),
      reviewTopicModel.title.value,
      reviewTopicModel.description.value,
      reviewTopicModel.consensuality
        ? reviewTopicModel.consensuality.value
        : null,
    );
  }

  public getSourceClass(): Type<ReviewTopic> {
    return ReviewTopic;
  }

  public getTargetClass(): Type<ReviewTopicTypeOrmEntity> {
    return ReviewTopicTypeOrmEntity;
  }
}

@Injectable()
export class ReverseReviewTopicTypeOrmEntityMap extends ObjectMap<
  ReviewTopicTypeOrmEntity,
  ReviewTopic
> {
  protected doMap(reviewTopicEntity: ReviewTopicTypeOrmEntity): ReviewTopic {
    return new ReviewTopic(
      ReviewTopicId.from(reviewTopicEntity.id),
      CreatedAt.from(reviewTopicEntity.createdAt),
      UpdatedAt.from(reviewTopicEntity.updatedAt),
      ReviewTopicTitle.from(reviewTopicEntity.title),
      ReviewTopicDescription.from(reviewTopicEntity.description),
      reviewTopicEntity.consensuality
        ? Consensuality.from(reviewTopicEntity.consensuality)
        : null,
    );
  }

  public getSourceClass(): Type<ReviewTopicTypeOrmEntity> {
    return ReviewTopicTypeOrmEntity;
  }

  public getTargetClass(): Type<ReviewTopic> {
    return ReviewTopic;
  }
}
