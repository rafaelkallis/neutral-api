import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { ReviewTopicId } from 'project/domain/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/value-objects/ReviewTopicDescription';

export interface ReadonlyReviewTopic extends ReadonlyModel<ReviewTopicId> {
  readonly projectId: ProjectId;
  readonly title: ReviewTopicTitle;
  readonly description: ReviewTopicDescription;
}

export class ReviewTopic extends Model<ReviewTopicId>
  implements ReadonlyReviewTopic {
  public projectId: ProjectId;
  public title: ReviewTopicTitle;
  public description: ReviewTopicDescription;

  public constructor(
    id: ReviewTopicId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    projectId: ProjectId,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.title = title;
    this.description = description;
  }

  /**
   *
   */
  public static from(
    projectId: ProjectId,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
  ): ReadonlyReviewTopic {
    const id = ReviewTopicId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    return new ReviewTopic(
      id,
      createdAt,
      updatedAt,
      projectId,
      title,
      description,
    );
  }
}
