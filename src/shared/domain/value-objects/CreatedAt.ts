import { TimestampValueObject } from 'shared/domain/value-objects/TimestampValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidCreatedAtException } from 'shared/domain/exceptions/InvalidCreatedAtException';

/**
 *
 */
export class CreatedAt extends TimestampValueObject {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(createdAt: number): CreatedAt {
    return new CreatedAt(createdAt);
  }

  /**
   *
   */
  public static now(): CreatedAt {
    return new CreatedAt(Date.now());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof CreatedAt)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidCreatedAtException();
  }
}
