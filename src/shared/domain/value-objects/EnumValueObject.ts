import { AtomicValueObject } from 'shared/domain/value-objects/AtomicValueObject';
import { InvalidEnumException } from 'shared/domain/exceptions/InvalidEnumException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class EnumValueObject<
  TValue extends string
> extends AtomicValueObject<TValue> {
  protected constructor(value: TValue) {
    super(value);
    this.assertEnum(value);
  }

  /**
   *
   */
  public toString(): string {
    return this.value;
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof EnumValueObject)) {
      return false;
    }
    return super.equals(other);
  }

  /**
   *
   */
  protected assertEnum(value: TValue): void {
    if (!Object.values(this.getEnumType()).includes(value)) {
      this.throwInvalidValueObjectException();
    }
  }

  /**
   *
   */
  protected throwInvalidValueObjectException(): never {
    throw new InvalidEnumException();
  }

  /**
   *
   */
  protected abstract getEnumType(): Record<string, string>;
}
