import { TimestampValueObject } from 'shared/domain/value-objects/TimestampValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class LastLoginAt extends TimestampValueObject {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(lastLoginAt: number): LastLoginAt {
    return new LastLoginAt(lastLoginAt);
  }

  /**
   *
   */
  public static now(): LastLoginAt {
    return new LastLoginAt(Date.now());
  }

  /**
   *
   */
  public static never(): LastLoginAt {
    return new LastLoginAt(0);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof LastLoginAt)) {
      return false;
    }
    return super.equals(other);
  }
}
