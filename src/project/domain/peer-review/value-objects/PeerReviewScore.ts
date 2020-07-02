import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidPeerReviewScoreException } from 'project/domain/exceptions/InvalidPeerReviewScoreException';

export class PeerReviewScore extends UnitDecimalValueObject {
  private static EPSILON = 1e-8;

  private constructor(value: number) {
    super(value);
    this.assertGreaterEqualThanEpsilon(value);
    this.assertLessEqualThanOneMinusEpsilon(value);
  }

  public static from(value: number): PeerReviewScore {
    if (Math.abs(value) < PeerReviewScore.EPSILON) {
      //console.log("fixing peer-review score by restricting value " + value + " below to a value close to but above 0");
      value = PeerReviewScore.EPSILON;
    }
    if (Math.abs(value - 1) < PeerReviewScore.EPSILON) {
      //console.log("fixing peer-review score by restricting value " + value + " above to a value close to but below 1");
      value = 1 - PeerReviewScore.EPSILON;
    }
    return new PeerReviewScore(value);
  }

  private assertGreaterEqualThanEpsilon(value: number): void {
    if (value < PeerReviewScore.EPSILON) {
      this.throwInvalidValueObjectException();
    }
  }

  private assertLessEqualThanOneMinusEpsilon(value: number): void {
    if (value > 1 - PeerReviewScore.EPSILON) {
      this.throwInvalidValueObjectException();
    }
  }

  public static equalSplit(n: number): PeerReviewScore {
    return PeerReviewScore.from(1 / (n - 1));
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidPeerReviewScoreException();
  }
}
