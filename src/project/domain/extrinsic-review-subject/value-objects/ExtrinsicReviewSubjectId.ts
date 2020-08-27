import { Id } from 'shared/domain/value-objects/Id';

export class ExtrinsicReviewSubjectId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static of(id: string): ExtrinsicReviewSubjectId {
    return new ExtrinsicReviewSubjectId(id);
  }

  public static create(): ExtrinsicReviewSubjectId {
    return new ExtrinsicReviewSubjectId(Id.createObjectId());
  }
}
