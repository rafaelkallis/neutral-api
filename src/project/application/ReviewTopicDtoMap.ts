import { Injectable } from '@nestjs/common';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicDto } from 'project/application/dto/ReviewTopicDto';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import {
  ReviewTopicInput,
  ContinuousReviewTopicInput,
  DiscreteReviewTopicInput,
} from 'project/domain/review-topic/ReviewTopicInput';
import {
  ReviewTopicInputDto,
  ReviewTopicInputType,
} from './dto/ReviewTopicInputDto';
import { ExtrinsicReviewSubjectType } from 'project/domain/review-topic/value-objects/ReviewSubjectType';
import { ExtrinsicReviewSubjectDto } from './dto/ExtrinsicReviewSubjectDto';

@Injectable()
@ObjectMap.register(ReviewTopic, ReviewTopicDto)
export class ReviewTopicDtoMap extends ObjectMap<ReviewTopic, ReviewTopicDto> {
  protected doMap(
    reviewTopic: ReviewTopic,
    context: ObjectMapContext,
  ): ReviewTopicDto {
    return new ReviewTopicDto(
      reviewTopic.id.value,
      reviewTopic.createdAt.value,
      reviewTopic.updatedAt.value,
      reviewTopic.title.value,
      reviewTopic.description.value,
      this.mapInput(reviewTopic.input),
      reviewTopic.subjectType.getLabel(),
      reviewTopic.subjectType instanceof ExtrinsicReviewSubjectType
        ? reviewTopic.subjectType.subjects.map((s) =>
            ExtrinsicReviewSubjectDto.ofExtrinsicReviewSubject(s),
          )
        : [],
      this.mapConsensuality(reviewTopic, context),
    );
  }

  private mapConsensuality(
    reviewTopic: ReviewTopic,
    context: ObjectMapContext,
  ): number | null {
    const project = context.get('project', Project);
    const authUser = context.get('authUser', User);
    if (!project.isCreator(authUser)) {
      return null;
    }
    if (!reviewTopic.consensuality) {
      return null;
    }
    return reviewTopic.consensuality.value;
  }

  private mapInput(input: ReviewTopicInput): ReviewTopicInputDto {
    return input.fold({
      continuous(
        continuousInput: ContinuousReviewTopicInput,
      ): ReviewTopicInputDto {
        return new ReviewTopicInputDto(
          ReviewTopicInputType.CONTINUOUS,
          continuousInput.min,
          continuousInput.max,
          undefined,
          undefined,
        );
      },
      discrete(discreteInput: DiscreteReviewTopicInput): ReviewTopicInputDto {
        return new ReviewTopicInputDto(
          ReviewTopicInputType.DISCRETE,
          undefined,
          undefined,
          discreteInput.labels,
          discreteInput.values,
        );
      },
    });
  }
}
