import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { Validator } from 'class-validator';
import { InvalidLastLoginAtException } from 'user/domain/exceptions/InvalidLastLoginAtException';

/**
 *
 */
export abstract class TimestampValueObject<
  T extends TimestampValueObject<T>
> extends ValueObject<T> {
  public readonly value: number;

  protected constructor(value: number) {
    super();
    const validator = new Validator();
    if (!validator.isNumber(value)) {
      throw new InvalidLastLoginAtException();
    }
    this.value = value;
  }

  /**
   *
   */
  public equals(otherTimestampValueObject: T): boolean {
    return this.value === otherTimestampValueObject.value;
  }

  /**
   *
   */
  public toString(): string {
    return String(this.value);
  }
}
