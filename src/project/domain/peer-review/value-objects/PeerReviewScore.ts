import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidPeerReviewScoreException } from 'project/domain/exceptions/InvalidPeerReviewScoreException';

export class PeerReviewScore extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  public static from(value: number): PeerReviewScore {
    const MIN_VAL = 1e-4;
    const MAX_VAL = 1.0 - MIN_VAL;
    var x;
    x = Math.max(value, MIN_VAL);
    x = Math.min(x, MAX_VAL);
    return new PeerReviewScore(x);
  }

  public static equalSplit(n: number): PeerReviewScore {
    return PeerReviewScore.from(1 / (n - 1));
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidPeerReviewScoreException();
  }
}
