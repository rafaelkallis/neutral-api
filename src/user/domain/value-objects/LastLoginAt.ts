import { TimestampValueObject } from 'shared/domain/value-objects/TimestampValueObject';

/**
 *
 */
export class LastLoginAt extends TimestampValueObject<LastLoginAt> {
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
}
