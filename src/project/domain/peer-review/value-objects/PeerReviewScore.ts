import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';

export class PeerReviewScore extends UnitDecimalValueObject {
  public static of(value: number): PeerReviewScore {
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

  private constructor(value: number) {
    super(value);
  }

  public normalize(rowsum: number): number {
    return this.value / rowsum;
  }
}
