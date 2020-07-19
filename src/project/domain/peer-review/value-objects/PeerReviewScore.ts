import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export class PeerReviewScore extends NumberValueObject {
  public static of(value: number): PeerReviewScore {
    if (value < -Number.EPSILON) {
      throw new DomainException(
        'invalid_peer_review_score',
        'Invalid peer-review score.',
      );
    }
    value = Math.max(value, Number.EPSILON);
    value = Math.min(value, Number.MAX_SAFE_INTEGER);
    return new PeerReviewScore(value);
  }

  private constructor(value: number) {
    super(value);
  }

  public normalize(rowsum: number): number {
    return this.value / rowsum;
  }
}
