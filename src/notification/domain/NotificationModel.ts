import { AbstractModel } from 'common';
import {
  MaxLength,
  IsString,
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Notification, NotificationType } from 'notification/notification';
import { UserModel } from 'user';

/**
 * Notification Model
 */
export class NotificationModel extends AbstractModel {
  @IsString()
  @MaxLength(24)
  public ownerId: string;

  @IsEnum(NotificationType)
  @MaxLength(64)
  public type: NotificationType;

  @IsBoolean()
  public isRead: boolean;

  @IsObject()
  public payload: object;

  public static fromNotification(
    notification: Notification,
  ): NotificationModel {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new NotificationModel(
      notification.id,
      createdAt,
      updatedAt,
      notification.ownerId,
      notification.type,
      notification.isRead,
      notification.payload,
    );
  }

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    ownerId: string,
    type: NotificationType,
    isRead: boolean,
    payload: object,
  ) {
    super(id, createdAt, updatedAt);
    this.ownerId = ownerId;
    this.type = type;
    this.isRead = isRead;
    this.payload = payload;
  }

  /**
   *
   */
  public isOwner(user: UserModel): boolean {
    return this.ownerId === user.id;
  }
}
