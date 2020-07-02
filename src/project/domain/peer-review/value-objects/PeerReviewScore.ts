import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidPeerReviewScoreException } from 'project/domain/exceptions/InvalidPeerReviewScoreException';

export class PeerReviewScore extends UnitDecimalValueObject {
  public static EPSILON = 1e-8;

  private constructor(value: number) {
    super(value);
    this.assertGreaterEqualThanEpsilon(value);
    this.assertLessEqualThanOneMinusEpsilon(value);
  }

  public static from(value: number): PeerReviewScore {
    if (value >= 0 && value < PeerReviewScore.EPSILON) {
      value = PeerReviewScore.EPSILON;
    }
    if (value >= 1 - PeerReviewScore.EPSILON && value <= 1) {
      value = 1 - PeerReviewScore.EPSILON;
    }
    return new PeerReviewScore(value);
  }

  private assertGreaterEqualThanEpsilon(value: number): void {
    if (value < PeerReviewScore.EPSILON) {
      throw new InvalidPeerReviewScoreException();
    }
  }

  private assertLessEqualThanOneMinusEpsilon(value: number): void {
    if (value > 1 - PeerReviewScore.EPSILON) {
      throw new InvalidPeerReviewScoreException();
    }
  }

  public static equalSplit(n: number): PeerReviewScore {
    return PeerReviewScore.from(1 / (n - 1));
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidPeerReviewScoreException();
  }
}
