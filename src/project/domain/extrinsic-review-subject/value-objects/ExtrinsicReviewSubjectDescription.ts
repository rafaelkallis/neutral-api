import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';

export class ExtrinsicReviewSubjectDescription extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 1024);
  }

  public static of(value: string): ExtrinsicReviewSubjectDescription {
    return new ExtrinsicReviewSubjectDescription(value);
  }
}
