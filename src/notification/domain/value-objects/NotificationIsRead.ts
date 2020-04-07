import { InvalidNotificationIsReadException } from 'notification/domain/exceptions/InvalidNotificationIsReadException';
import { BooleanValueObject } from 'shared/domain/value-objects/BooleanValueObject';

/**
 *
 */
export class NotificationIsRead extends BooleanValueObject<NotificationIsRead> {
  public static from(value: boolean): NotificationIsRead {
    return new NotificationIsRead(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidNotificationIsReadException();
  }
}
