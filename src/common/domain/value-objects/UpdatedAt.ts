import { TimestampValueObject } from 'common/domain/value-objects/TimestampValueObject';

/**
 *
 */
export class UpdatedAt extends TimestampValueObject<UpdatedAt> {
  protected constructor(value: number) {
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
}
