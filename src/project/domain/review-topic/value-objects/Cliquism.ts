import { UnitDecimalValueObject } from 'shared/domain/value-objects/UnitDecimalValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class Cliquism extends UnitDecimalValueObject {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(value: number): Cliquism {
    return new Cliquism(value);
  }

  public isCliquey(): boolean {
    return this.value >= 0.2;
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Cliquism)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new Error('invalid cliquism value');
  }
}
