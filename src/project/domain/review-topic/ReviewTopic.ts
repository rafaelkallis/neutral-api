import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { Cliquism } from 'project/domain/review-topic/value-objects/Cliquism';

export interface ReadonlyReviewTopic extends ReadonlyModel<ReviewTopicId> {
  readonly title: ReviewTopicTitle;
  readonly description: ReviewTopicDescription;
  readonly consensuality: Consensuality | null;
  readonly cliquism: Cliquism | null;

  isConsensual(): boolean;
  isCliquey(): boolean;
}

export class ReviewTopic extends Model<ReviewTopicId>
  implements ReadonlyReviewTopic {
  public title: ReviewTopicTitle;
  public description: ReviewTopicDescription;
  public consensuality: Consensuality | null;
  public cliquism: Cliquism | null;

  public constructor(
    id: ReviewTopicId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    consensuality: Consensuality | null,
    cliquism: Cliquism | null,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.consensuality = consensuality;
    this.cliquism = cliquism;
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
    const consensuality = null;
    const cliquism = null;
    return new ReviewTopic(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      consensuality,
      cliquism,
    );
  }

  public isConsensual(): boolean {
    return this.consensuality !== null && this.consensuality.isConsensual();
  }

  public isCliquey(): boolean {
    return this.cliquism !== null && this.cliquism.isCliquey();
  }
}
