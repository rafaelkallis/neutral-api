import { NumberValueObject } from 'shared/domain/value-objects/NumberValueObject';
import { InvalidTimestampException } from 'shared/domain/exceptions/InvalidTimestampException';

/**
 *
 */
export abstract class TimestampValueObject<
  T extends TimestampValueObject<T>
> extends NumberValueObject<TimestampValueObject<T>> {
  protected constructor(value: number) {
    super(value);
    this.assertTimestamp(value);
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
