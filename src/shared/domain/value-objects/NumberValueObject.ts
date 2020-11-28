import { SingleValueObject } from 'shared/domain/value-objects/SingleValueObject';
import { InvalidNumberException } from 'shared/domain/exceptions/InvalidNumberException';
import { ValueObject } from './ValueObject';
import { Comprarable } from './Comparable';

/**
 *
 */
export abstract class NumberValueObject
  extends SingleValueObject<number>
  implements Comprarable<NumberValueObject> {
  protected constructor(value: number) {
    super(value);
    this.assertNumber(value);
  }

  /**
   *
   */
  public toString(): string {
    return this.value.toString();
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof NumberValueObject)) {
      return false;
    }
    return super.equals(other);
  }

  public greaterThan(other: ValueObject): boolean {
    if (!(other instanceof NumberValueObject)) {
      return false;
    }
    return this.compareTo(other) > 0;
  }

  public compareTo(other: NumberValueObject): number {
    return this.value - other.value;
  }

  private assertNumber(value: number): void {
    if (typeof value !== 'number') {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidNumberException();
  }
}
