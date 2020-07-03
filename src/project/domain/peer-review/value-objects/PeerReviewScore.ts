import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidPeerReviewScoreException } from 'project/domain/exceptions/InvalidPeerReviewScoreException';

export class PeerReviewScore extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
    this.assertGreaterEqualThanEpsilon(value);
    this.assertLessEqualThanOneMinusEpsilon(value);
  }

  public static from(value: number): PeerReviewScore {
    // if value in [-eps, eps] then value = eps
    if (Math.abs(value) <= Number.EPSILON) {
      value = Number.EPSILON;
    }
    // if value in [1-eps, 1+eps] then value = 1-eps
    if (Math.abs(1 - value) <= Number.EPSILON) {
      value = 1 - Number.EPSILON;
    }
    return new PeerReviewScore(value);
  }

  private assertGreaterEqualThanEpsilon(value: number): void {
    if (value < Number.EPSILON) {
      this.throwInvalidValueObjectException();
    }
  }

  private assertLessEqualThanOneMinusEpsilon(value: number): void {
    if (value > 1 - Number.EPSILON) {
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
