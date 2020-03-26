import { TimestampValueObject } from 'shared/domain/value-objects/TimestampValueObject';

/**
 *
 */
export class CreatedAt extends TimestampValueObject<CreatedAt> {
  protected constructor(value: number) {
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
}
