import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { ReviewTopicId } from 'project/domain/value-objects/ReviewTopicId';
import { ReadonlyReviewTopic, ReviewTopic } from 'project/domain/ReviewTopic';

export interface ReadonlyReviewTopicCollection
  extends ReadonlyModelCollection<ReviewTopicId, ReadonlyReviewTopic> {}

export class ReviewTopicCollection
  extends ModelCollection<ReviewTopicId, ReviewTopic>
  implements ReadonlyReviewTopicCollection {}
