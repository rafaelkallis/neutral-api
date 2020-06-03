import { AtomicValueObject } from 'shared/domain/value-objects/AtomicValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ValueObjectException } from 'shared/domain/exceptions/ValueObjectException';

/**
 *
 */
export abstract class BooleanValueObject extends AtomicValueObject<boolean> {
  protected constructor(value: boolean) {
    super(value);
    this.assertBoolean(value);
  }

  public equals(other: ValueObject): boolean {
    return other instanceof BooleanValueObject && super.equals(other);
  }

  protected assertBoolean(value: boolean): void {
    if (typeof value !== 'boolean') {
      throw new ValueObjectException(
        'invalid_boolean',
        `${String(value)} is not a boolean value object`,
      );
    }
  }
}
