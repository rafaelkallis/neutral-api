import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Class } from 'shared/domain/Class';
import { ExtrinsicReviewSubjectId } from 'project/domain/extrinsic-review-subject/value-objects/ExtrinsicReviewSubjectId';
import { ExtrinsicReviewSubjectTitle } from 'project/domain/extrinsic-review-subject/value-objects/ExtrinsicReviewSubjectTitle';
import { ExtrinsicReviewSubjectDescription } from 'project/domain/extrinsic-review-subject/value-objects/ExtrinsicReviewSubjectDescription';

export interface ReadonlyExtrinsicReviewSubject
  extends ReadonlyModel<ExtrinsicReviewSubjectId> {
  readonly title: ExtrinsicReviewSubjectTitle;
  readonly description: ExtrinsicReviewSubjectDescription;
}

export class ExtrinsicReviewSubject extends Model<ExtrinsicReviewSubjectId>
  implements ReadonlyExtrinsicReviewSubject {
  public title: ExtrinsicReviewSubjectTitle;
  public description: ExtrinsicReviewSubjectDescription;

  public constructor(
    id: ExtrinsicReviewSubjectId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ExtrinsicReviewSubjectTitle,
    description: ExtrinsicReviewSubjectDescription,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
  }

  public static of(
    title: ExtrinsicReviewSubjectTitle,
    description: ExtrinsicReviewSubjectDescription,
  ): ExtrinsicReviewSubject {
    const id = ExtrinsicReviewSubjectId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    return new ExtrinsicReviewSubject(
      id,
      createdAt,
      updatedAt,
      title,
      description,
    );
  }

  public getClass(): Class<ExtrinsicReviewSubject> {
    return ExtrinsicReviewSubject;
  }
}
