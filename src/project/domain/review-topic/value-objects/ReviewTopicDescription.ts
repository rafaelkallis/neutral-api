import { InvalidReviewTopicDescriptionException } from 'project/domain/exceptions/InvalidReviewTopicDescriptionException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class ReviewTopicDescription extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 1024);
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
