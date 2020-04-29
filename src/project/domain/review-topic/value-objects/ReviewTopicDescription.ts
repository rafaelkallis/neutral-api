import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidReviewTopicDescriptionException } from 'project/domain/exceptions/InvalidReviewTopicDescriptionException';

/**
 *
 */
export class ReviewTopicDescription extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static from(value: string): ReviewTopicDescription {
    return new ReviewTopicDescription(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ReviewTopicDescription)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidReviewTopicDescriptionException();
  }
}
