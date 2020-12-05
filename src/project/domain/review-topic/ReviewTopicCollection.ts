import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import {
  ReadonlyReviewTopic,
  ReviewTopic,
} from 'project/domain/review-topic/ReviewTopic';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export interface ReadonlyReviewTopicCollection
  extends ReadonlyModelCollection<ReviewTopicId, ReadonlyReviewTopic> {
  assertSufficientAmount(): void;
}

export class ReviewTopicCollection
  extends ModelCollection<ReviewTopicId, ReviewTopic>
  implements ReadonlyReviewTopicCollection {
  public assertSufficientAmount(): void {
    if (this.length === 0) {
      throw new DomainException(
        'insufficient_review_topic_amount',
        'The number of review topics is insufficient, at least 1 is needed',
      );
    }
  }
}
