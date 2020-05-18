import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Consensuality } from '../project/value-objects/Consensuality';

export interface ReadonlyReviewTopic extends ReadonlyModel<ReviewTopicId> {
  readonly title: ReviewTopicTitle;
  readonly description: ReviewTopicDescription;
  readonly consensuality: Consensuality | null;

  isConsensual(): boolean;
}

export class ReviewTopic extends Model<ReviewTopicId>
  implements ReadonlyReviewTopic {
  public title: ReviewTopicTitle;
  public description: ReviewTopicDescription;
  public consensuality: Consensuality | null;

  public constructor(
    id: ReviewTopicId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    consensuality: Consensuality | null,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.consensuality = consensuality;
  }

  /**
   * // TODO instantiate from constructor ?
   */
  public static from(
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
  ): ReviewTopic {
    const id = ReviewTopicId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const consensuality = null;
    return new ReviewTopic(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      consensuality,
    );
  }

  public isConsensual(): boolean {
    return this.consensuality !== null && this.consensuality.isConsensual();
  }
}
