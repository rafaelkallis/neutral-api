import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidPeerReviewScoreException } from 'project/domain/exceptions/InvalidPeerReviewScoreException';

/**
 *
 */
export class PeerReviewScore extends UnitDecimalValueObject {
  public static EPSILON = 1e-8;

  private constructor(value: number) {
    super(value);
    this.assertGreaterEqualThanEpsilon(value);
  }

  public static from(value: number): PeerReviewScore {
    if (value >= 0 && value < PeerReviewScore.EPSILON) {
      value = PeerReviewScore.EPSILON;
    }
    return new PeerReviewScore(value);
  }

  private assertGreaterEqualThanEpsilon(value: number): void {
    if (value < PeerReviewScore.EPSILON) {
      throw new InvalidPeerReviewScoreException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidPeerReviewScoreException();
  }
}
