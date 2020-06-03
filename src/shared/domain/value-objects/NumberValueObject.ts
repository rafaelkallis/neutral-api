import { AtomicValueObject } from 'shared/domain/value-objects/AtomicValueObject';
import { InvalidNumberException } from 'shared/domain/exceptions/InvalidNumberException';
import { ValueObject } from './ValueObject';

/**
 *
 */
export abstract class NumberValueObject extends AtomicValueObject<number> {
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

  private assertNumber(value: number): void {
    if (typeof value !== 'number') {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidNumberException();
  }
}
