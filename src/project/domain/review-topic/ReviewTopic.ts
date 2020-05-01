import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';

export interface ReadonlyReviewTopic extends ReadonlyModel<ReviewTopicId> {
  readonly title: ReviewTopicTitle;
  readonly description: ReviewTopicDescription;
}

export class ReviewTopic extends Model<ReviewTopicId>
  implements ReadonlyReviewTopic {
  public title: ReviewTopicTitle;
  public description: ReviewTopicDescription;

  public constructor(
    id: ReviewTopicId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
  }

  /**
   *
   */
  public static from(
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
  ): ReviewTopic {
    const id = ReviewTopicId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    return new ReviewTopic(id, createdAt, updatedAt, title, description);
  }
}
