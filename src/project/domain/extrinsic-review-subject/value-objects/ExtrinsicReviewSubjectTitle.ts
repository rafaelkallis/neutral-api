import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';

export class ExtrinsicReviewSubjectTitle extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }

  public static of(value: string): ExtrinsicReviewSubjectTitle {
    return new ExtrinsicReviewSubjectTitle(value);
  }
}
