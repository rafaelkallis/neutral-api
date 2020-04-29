import { BooleanValueObject } from 'shared/domain/value-objects/BooleanValueObject';
import { InvalidHasSubmittedPeerReviewsException } from 'project/domain/exceptions/InvalidHasSubmittedPeerReviewsException';

/**
 *
 */
export class HasSubmittedPeerReviews extends BooleanValueObject {
  public static TRUE = HasSubmittedPeerReviews.from(true);
  public static FALSE = HasSubmittedPeerReviews.from(false);

  private constructor(value: boolean) {
    super(value);
  }

  public static from(value: boolean): HasSubmittedPeerReviews {
    return new HasSubmittedPeerReviews(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidHasSubmittedPeerReviewsException();
  }
}
