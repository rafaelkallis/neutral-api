import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import {
  ReadonlyReviewTopic,
  ReviewTopic,
} from 'project/domain/review-topic/ReviewTopic';

export interface ReadonlyReviewTopicCollection
  extends ReadonlyModelCollection<ReviewTopicId, ReadonlyReviewTopic> {}

export class ReviewTopicCollection
  extends ModelCollection<ReviewTopicId, ReviewTopic>
  implements ReadonlyReviewTopicCollection {}
