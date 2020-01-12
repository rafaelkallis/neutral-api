import { AbstractEntity } from 'common';
import { Column, Entity } from 'typeorm';
import {
  MaxLength,
  IsString,
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Notification, NotificationType } from 'notification/notification';
import { User } from 'user';

/**
 * Notification Entity
 */
@Entity('notifications')
export class NotificationEntity extends AbstractEntity implements Notification {
  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(24)
  public ownerId: string;

  @Column({ name: 'type', type: 'enum', enum: NotificationType })
  @IsEnum(NotificationType)
  @MaxLength(64)
  public type: NotificationType;

  @Column({ name: 'is_read' })
  @IsBoolean()
  public isRead: boolean;

  @Column({ name: 'payload', type: 'jsonb' })
  @IsObject()
  public payload: object;

  public static fromNotification(
    notification: Notification,
  ): NotificationEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new NotificationEntity(
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
  public isOwner(user: User): boolean {
    return this.ownerId === user.id;
  }
}
