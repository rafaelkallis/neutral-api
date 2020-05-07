import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

/**
 *
 */
@DomainEventKey('project.review_topic_updated')
export class ReviewTopicUpdatedEvent extends DomainEvent {
  public readonly reviewTopic: ReviewTopicId;

  constructor(reviewTopic: ReviewTopicId) {
    super();
    this.reviewTopic = reviewTopic;
  }
}
