import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ExtrinsicReviewSubject } from 'project/domain/extrinsic-review-subject/ExtrinsicReviewSubject';
import { ValidationException } from 'shared/application/exceptions/ValidationException';

export enum ReviewSubjectTypeLabel {
  INTRINSIC = 'intrinsic',
  EXTRINSIC = 'extrinsic',
}

export abstract class ReviewSubjectType extends ValueObject {
  public static of(
    label: ReviewSubjectTypeLabel,
    extrinsicReviewSubjects?: ExtrinsicReviewSubject[],
  ): ReviewSubjectType {
    if (label === ReviewSubjectTypeLabel.INTRINSIC) {
      return new IntrinsicReviewSubjectType();
    }
    if (label === ReviewSubjectTypeLabel.EXTRINSIC) {
      if (!extrinsicReviewSubjects) {
        throw new ValidationException('no extrinsic subjects provided');
      }
      return new ExtrinsicReviewSubjectType(extrinsicReviewSubjects);
    }
    throw new ValidationException(
      `no matching review subject type for label ${label}`,
    );
  }

  public abstract getLabel(): ReviewSubjectTypeLabel;
}

export class IntrinsicReviewSubjectType extends ReviewSubjectType {
  public getLabel(): ReviewSubjectTypeLabel {
    return ReviewSubjectTypeLabel.INTRINSIC;
  }
}

export class ExtrinsicReviewSubjectType extends ReviewSubjectType {
  public readonly subjects: ExtrinsicReviewSubject[];

  public getLabel(): ReviewSubjectTypeLabel {
    return ReviewSubjectTypeLabel.EXTRINSIC;
  }

  public constructor(subjects: ExtrinsicReviewSubject[]) {
    super();
    this.subjects = subjects;
  }
}
