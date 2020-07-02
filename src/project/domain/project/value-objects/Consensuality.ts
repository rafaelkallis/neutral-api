import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidConsensualityException } from 'project/domain/exceptions/InvalidConsensualityException';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export class Consensuality extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  public static from(value: number): Consensuality {
    if (value < PeerReviewScore.EPSILON) {
      //console.log("fixing consensuality score by restricting value " + value + " below to a value close but above 0");
      value = PeerReviewScore.EPSILON;
    }
    return new Consensuality(value);
  }

  public isConsensual(): boolean {
    return this.value >= 0.8;
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Consensuality)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidConsensualityException();
  }
}
