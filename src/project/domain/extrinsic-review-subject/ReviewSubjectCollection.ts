import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { ExtrinsicReviewSubjectId } from 'project/domain/extrinsic-review-subject/value-objects/ExtrinsicReviewSubjectId';
import {
  ReadonlyExtrinsicReviewSubject,
  ExtrinsicReviewSubject,
} from 'project/domain/extrinsic-review-subject/ExtrinsicReviewSubject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export interface ReadonlyReviewSubjectCollection
  extends ReadonlyModelCollection<
    ExtrinsicReviewSubjectId,
    ReadonlyExtrinsicReviewSubject
  > {
  assertSufficientAmount(): void;
}

export class ReviewSubjectCollection
  extends ModelCollection<ExtrinsicReviewSubjectId, ExtrinsicReviewSubject>
  implements ReadonlyReviewSubjectCollection {
  public assertSufficientAmount(): void {
    if (this.toArray().length < 1) {
      throw new DomainException(
        'insufficient_review_subjects',
        'Insufficient number of review subjects.',
      );
    }
  }
}
