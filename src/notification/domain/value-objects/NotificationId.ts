import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidNotificationIdException } from 'notification/domain/exceptions/InvalidNotificationIdException';

/**
 *
 */
export class NotificationId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static from(id: string): NotificationId {
    return new NotificationId(id);
  }

  public static create(): NotificationId {
    return new NotificationId(Id.createObjectId());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof NotificationId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidNotificationIdException();
  }
}
