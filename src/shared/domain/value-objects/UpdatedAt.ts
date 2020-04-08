import { TimestampValueObject } from 'shared/domain/value-objects/TimestampValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidUpdatedAtException } from 'shared/domain/exceptions/InvalidUpdatedAtException';

/**
 *
 */
export class UpdatedAt extends TimestampValueObject {
  private constructor(value: number) {
    super(value);
  }

  /**
   *
   */
  public static from(updatedAt: number): UpdatedAt {
    return new UpdatedAt(updatedAt);
  }

  /**
   *
   */
  public static now(): UpdatedAt {
    return new UpdatedAt(Date.now());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof UpdatedAt)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidUpdatedAtException();
  }
}
