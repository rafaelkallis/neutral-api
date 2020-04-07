import { SingleValueObject } from 'shared/domain/value-objects/SingleValueObject';
import { InvalidEnumException } from '../exceptions/InvalidEnumException';

/**
 *
 */
export abstract class EnumValueObject<
  TValue extends string,
  TEnumValueObject extends EnumValueObject<TValue, TEnumValueObject>
> extends SingleValueObject<TValue, TEnumValueObject> {
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
