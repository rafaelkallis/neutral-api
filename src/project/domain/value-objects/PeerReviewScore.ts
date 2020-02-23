import { UnitDecimalValueObject } from 'common/domain/value-objects/UnitDecimalValueObject';
import { InvalidConsensualityException } from 'project/domain/exceptions/InvalidConsensualityException';

/**
 *
 */
export class PeerReviewScore extends UnitDecimalValueObject<PeerReviewScore> {
  /**
   *
   */
  public static from(value: number): PeerReviewScore {
    return new PeerReviewScore(value);
  }

  /**
   *
   */
  protected throwInvalidValueObjectException(): never {
    throw new InvalidConsensualityException();
  }
}
