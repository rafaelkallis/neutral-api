import { Injectable, Type } from '@nestjs/common';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicDto } from 'project/application/dto/ReviewTopicDto';

@Injectable()
export class ReviewTopicDtoMap extends ObjectMap<ReviewTopic, ReviewTopicDto> {
  protected doMap(reviewTopic: ReviewTopic): ReviewTopicDto {
    return new ReviewTopicDto(
      reviewTopic.id.value,
      reviewTopic.title.value,
      reviewTopic.description.value,
      reviewTopic.createdAt.value,
      reviewTopic.updatedAt.value,
    );
  }

  public getSourceType(): Type<ReviewTopic> {
    return ReviewTopic;
  }

  public getTargetType(): Type<ReviewTopicDto> {
    return ReviewTopicDto;
  }
}
