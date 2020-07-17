import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export class PeerReviewScore extends NumberValueObject {
  public static of(value: number): PeerReviewScore {
    // if value in [-eps, eps] then value = eps
    if (Math.abs(value) <= Number.EPSILON) {
      value = Number.EPSILON;
    }
    // if value in [1-eps, 1+eps] then value = 1-eps
    if (Math.abs(1 - value) <= Number.EPSILON) {
      value = 1 - Number.EPSILON;
    }
    if (value < Number.EPSILON || value >= Number.MAX_SAFE_INTEGER / 1e3) {
      throw new DomainException(
        'invalid_peer_review_score',
        'Invalid peer-review score',
      );
    }
    return new PeerReviewScore(value);
  }

  private constructor(value: number) {
    super(value);
  }

  public normalize(rowsum: number): number {
    return this.value / rowsum;
  }
}
