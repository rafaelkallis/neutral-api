import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import {
  ReadonlyReviewTopic,
  ReviewTopic,
} from 'project/domain/review-topic/ReviewTopic';
import { InsufficientReviewTopicAmountException } from '../exceptions/InsufficientReviewTopicAmountException';

export interface ReadonlyReviewTopicCollection
  extends ReadonlyModelCollection<ReviewTopicId, ReadonlyReviewTopic> {
  assertSufficientAmount(): void;
}

export class ReviewTopicCollection
  extends ModelCollection<ReviewTopicId, ReviewTopic>
  implements ReadonlyReviewTopicCollection {
  public assertSufficientAmount(): void {
    if (this.toArray().length < 1) {
      throw new InsufficientReviewTopicAmountException();
    }
  }
}
