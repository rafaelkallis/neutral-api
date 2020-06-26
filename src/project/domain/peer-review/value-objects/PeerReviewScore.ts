import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidPeerReviewScoreException } from 'project/domain/exceptions/InvalidPeerReviewScoreException';

/**
 *
 */
export class PeerReviewScore extends UnitDecimalValueObject {
  public static readonly EPSILON = 1e-4;

  public constructor(value: number) {
    super(value);
    this.assertGreaterEqualThanEpsilon(value);
  }

  /**
   *
   */
  public static from(value: number): PeerReviewScore {
    return new PeerReviewScore(value);
  }

  private assertGreaterEqualThanEpsilon(value: number): void {
    if (value < PeerReviewScore.EPSILON) {
      throw new InvalidPeerReviewScoreException();
    }
  }

  /**
   *
   */
  protected throwInvalidValueObjectException(): never {
    throw new InvalidPeerReviewScoreException();
  }
}
