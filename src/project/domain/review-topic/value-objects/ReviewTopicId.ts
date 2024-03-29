import { InvalidReviewTopicIdException } from 'project/domain/exceptions/InvalidReviewTopicIdException';
import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class ReviewTopicId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static from(id: string): ReviewTopicId {
    return new ReviewTopicId(id);
  }

  public static create(): ReviewTopicId {
    return new ReviewTopicId(Id.createInner());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ReviewTopicId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidReviewTopicIdException();
  }
}
