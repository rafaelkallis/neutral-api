import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import {
  ContinuousReviewTopicInput,
  DiscreteReviewTopicInput,
  ReviewTopicInput,
} from 'project/domain/review-topic/ReviewTopicInput';
import { ReviewTopicInputTypeOrmEntity } from './ReviewTopicInputTypeOrmEntity';

export enum ReviewTopicInputType {
  CONTINUOUS = 'continuous',
  DISCRETE = 'discrete',
}

@Injectable()
@ObjectMap.register(ReviewTopic, ReviewTopicTypeOrmEntity)
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
      this.mapReviewTopicInput(reviewTopicModel),
      reviewTopicModel.consensuality
        ? reviewTopicModel.consensuality.value
        : null,
    );
  }

  private mapReviewTopicInput(
    reviewTopic: ReviewTopic,
  ): ReviewTopicInputTypeOrmEntity {
    return reviewTopic.input.fold({
      continuous(
        input: ContinuousReviewTopicInput,
      ): ReviewTopicInputTypeOrmEntity {
        return new ReviewTopicInputTypeOrmEntity(
          ReviewTopicInputType.CONTINUOUS,
          input.min,
          input.max,
          null,
          null,
        );
      },
      discrete(input: DiscreteReviewTopicInput): ReviewTopicInputTypeOrmEntity {
        return new ReviewTopicInputTypeOrmEntity(
          ReviewTopicInputType.DISCRETE,
          null,
          null,
          input.labels,
          input.values,
        );
      },
    });
  }
}

@Injectable()
@ObjectMap.register(ReviewTopicTypeOrmEntity, ReviewTopic)
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
      this.mapInput(reviewTopicEntity.input),
      reviewTopicEntity.consensuality
        ? Consensuality.from(reviewTopicEntity.consensuality)
        : null,
    );
  }

  private mapInput(input: ReviewTopicInputTypeOrmEntity): ReviewTopicInput {
    // TODO more descriptive errors
    switch (input.type) {
      case ReviewTopicInputType.CONTINUOUS: {
        if (input.continuousMin === null) {
          throw new InternalServerErrorException();
        }
        if (input.continuousMax === null) {
          throw new InternalServerErrorException();
        }
        return ContinuousReviewTopicInput.of(
          input.continuousMin,
          input.continuousMax,
        );
      }
      case ReviewTopicInputType.DISCRETE: {
        if (input.discreteLabels === null) {
          throw new InternalServerErrorException();
        }
        if (input.discreteValues === null) {
          throw new InternalServerErrorException();
        }
        return DiscreteReviewTopicInput.of(
          input.discreteLabels,
          input.discreteValues,
        );
      }
      default:
        throw new InternalServerErrorException();
    }
  }
}
