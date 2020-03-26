import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { InvalidConsensualityException } from 'project/domain/exceptions/InvalidConsensualityException';

/**
 *
 */
export class Consensuality extends UnitDecimalValueObject<Consensuality> {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(value: number): Consensuality {
    return new Consensuality(value);
  }

  public isConsensual(): boolean {
    return this.value >= 0.8;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidConsensualityException();
  }
}
