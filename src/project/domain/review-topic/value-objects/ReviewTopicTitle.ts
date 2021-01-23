import { InvalidReviewTopicTitleException } from 'project/domain/exceptions/InvalidReviewTopicTitleException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class ReviewTopicTitle extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static from(value: string): ReviewTopicTitle {
    return new ReviewTopicTitle(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ReviewTopicTitle)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidReviewTopicTitleException();
  }
}
