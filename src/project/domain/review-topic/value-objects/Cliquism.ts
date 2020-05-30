import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';

export class Cliquism extends NumberValueObject {
  private constructor(value: number) {
    super(value);
  }

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
