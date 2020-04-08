import { InvalidNotificationIsReadException } from 'notification/domain/exceptions/InvalidNotificationIsReadException';
import { BooleanValueObject } from 'shared/domain/value-objects/BooleanValueObject';

/**
 *
 */
export class NotificationIsRead extends BooleanValueObject {
  public static from(value: boolean): NotificationIsRead {
    return new NotificationIsRead(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidNotificationIsReadException();
  }
}
