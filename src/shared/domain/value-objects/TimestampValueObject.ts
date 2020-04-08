import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';
import { InvalidTimestampException } from 'shared/domain/exceptions/InvalidTimestampException';
import { ValueObject } from './ValueObject';

/**
 *
 */
export abstract class TimestampValueObject extends NumberValueObject {
  protected constructor(value: number) {
    super(value);
    this.assertTimestamp(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof TimestampValueObject)) {
      return false;
    }
    return super.equals(other);
  }

  private assertTimestamp(value: number) {
    if (value < 0) {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidTimestampException();
  }
}
