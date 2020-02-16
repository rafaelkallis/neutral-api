import { EnumValueObject } from 'common/domain/value-objects/EnumValueObject';
import { Validator } from 'class-validator';
import { InvalidNotificationTypeException } from 'notification/domain/exceptions/InvalidNotificationTypeException';
import { InternalServerErrorException } from '@nestjs/common';

/**
 *
 */
export enum NotificationTypeValue {
  NEW_ASSIGNMENT = 'new_assignment',
  PEER_REVIEW_REQUESTED = 'peer_review_requested',
  MANAGER_REVIEW_REQUESTED = 'manager_review_requested',
  PROJECT_FINISHED = 'project_finished',
}

export abstract class NotificationType extends EnumValueObject<
  NotificationTypeValue,
  NotificationType
> {
  public static readonly NEW_ASSIGNMENT = NotificationType.from(
    NotificationTypeValue.NEW_ASSIGNMENT,
  );
  public static readonly PEER_REVIEW_REQUESTED = NotificationType.from(
    NotificationTypeValue.PEER_REVIEW_REQUESTED,
  );
  public static readonly MANAGER_REVIEW_REQUESTED = NotificationType.from(
    NotificationTypeValue.MANAGER_REVIEW_REQUESTED,
  );
  public static readonly PROJECT_FINISHED = NotificationType.from(
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
        throw new InternalServerErrorException();
      }
    }
  }
}

export class NewAssignmentNotificationType extends NotificationType {
  public static readonly INSTANCE = new NewAssignmentNotificationType();
  private constructor() {
    super();
  }

  public toValue(): NotificationTypeValue {
    return NotificationTypeValue.NEW_ASSIGNMENT;
  }
}

export class PeerReviewRequestedNotificationType extends NotificationType {
  public static readonly INSTANCE = new PeerReviewRequestedNotificationType();
  private constructor() {
    super();
  }

  public toValue(): NotificationTypeValue {
    return NotificationTypeValue.PEER_REVIEW_REQUESTED;
  }
}

export class ManagerReviewRequestedNotificationType extends NotificationType {
  public static readonly INSTANCE = new ManagerReviewRequestedNotificationType();
  private constructor() {
    super();
  }

  public toValue(): NotificationTypeValue {
    return NotificationTypeValue.MANAGER_REVIEW_REQUESTED;
  }
}

export class ProjectFinishedNotificationType extends NotificationType {
  public static readonly INSTANCE = new ProjectFinishedNotificationType();
  private constructor() {
    super();
  }

  public toValue(): NotificationTypeValue {
    return NotificationTypeValue.PROJECT_FINISHED;
  }
}
