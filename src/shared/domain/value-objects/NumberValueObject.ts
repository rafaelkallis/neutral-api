import { SingleValueObject } from 'shared/domain/value-objects/SingleValueObject';
import { InvalidNumberException } from 'shared/domain/exceptions/InvalidNumberException';

/**
 *
 */
export abstract class NumberValueObject<
  T extends NumberValueObject<T>
> extends SingleValueObject<number, NumberValueObject<T>> {
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

  private assertNumber(value: number): void {
    if (typeof value !== 'number') {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidNumberException();
  }
}
