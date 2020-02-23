import { EnumValueObject } from 'common/domain/value-objects/EnumValueObject';
import { Validator } from 'class-validator';
import { InvalidNotificationTypeException } from 'notification/domain/exceptions/InvalidNotificationTypeException';

/**
 *
 */
export enum NotificationTypeValue {
  NEW_ASSIGNMENT = 'new_assignment',
  PEER_REVIEW_REQUESTED = 'peer_review_requested',
  MANAGER_REVIEW_REQUESTED = 'manager_review_requested',
  PROJECT_FINISHED = 'project_finished',
}

export class NotificationType extends EnumValueObject<
  NotificationTypeValue,
  NotificationType
> {
  public static readonly NEW_ASSIGNMENT = new NotificationType(
    NotificationTypeValue.NEW_ASSIGNMENT,
  );
  public static readonly PEER_REVIEW_REQUESTED = new NotificationType(
    NotificationTypeValue.PEER_REVIEW_REQUESTED,
  );
  public static readonly MANAGER_REVIEW_REQUESTED = new NotificationType(
    NotificationTypeValue.MANAGER_REVIEW_REQUESTED,
  );
  public static readonly PROJECT_FINISHED = new NotificationType(
    NotificationTypeValue.PROJECT_FINISHED,
  );

  /**
   *
   */
  public static from(value: NotificationTypeValue): NotificationType {
    const validator = new Validator();
    if (!validator.isEnum(value, NotificationTypeValue)) {
      throw new InvalidNotificationTypeException();
    }
    switch (value) {
      case NotificationTypeValue.NEW_ASSIGNMENT: {
        return NotificationType.NEW_ASSIGNMENT;
      }
      case NotificationTypeValue.PEER_REVIEW_REQUESTED: {
        return NotificationType.PEER_REVIEW_REQUESTED;
      }
      case NotificationTypeValue.MANAGER_REVIEW_REQUESTED: {
        return NotificationType.MANAGER_REVIEW_REQUESTED;
      }
      case NotificationTypeValue.PROJECT_FINISHED: {
        return NotificationType.PROJECT_FINISHED;
      }
      default: {
        throw new InvalidNotificationTypeException();
      }
    }
  }

  protected getEnumType(): Record<string, string> {
    return NotificationTypeValue;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidNotificationTypeException();
  }
}
