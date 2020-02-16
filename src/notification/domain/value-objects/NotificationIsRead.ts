import { Validator } from 'class-validator';
import { PrimitiveValueObject } from 'common/domain/value-objects/PrimitiveValueObject';
import { InvalidNotificationIsReadException } from 'notification/domain/exceptions/InvalidNotificationIsReadException';

/**
 *
 */
export class NotificationIsRead extends PrimitiveValueObject<
  boolean,
  NotificationIsRead
> {
  /**
   *
   */
  public static from(value: boolean): NotificationIsRead {
    const validator = new Validator();
    if (!validator.isBoolean(value)) {
      throw new InvalidNotificationIsReadException();
    }
    return new NotificationIsRead(value);
  }

  /**
   *
   */
  public toString(): string {
    return this.value.toString();
  }
}
