import { Injectable } from '@nestjs/common';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicDto } from 'project/application/dto/ReviewTopicDto';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';

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
}
