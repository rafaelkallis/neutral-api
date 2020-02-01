import { AbstractEntity } from 'common';
import { Column, Entity } from 'typeorm';
import { NotificationType } from 'notification/notification';

/**
 * Notification Entity
 */
@Entity('notifications')
export class NotificationEntity extends AbstractEntity {
  @Column({ name: 'owner_id' })
  public ownerId: string;

  @Column({ name: 'type', type: 'enum', enum: NotificationType })
  public type: NotificationType;

  @Column({ name: 'is_read' })
  public isRead: boolean;

  @Column({ name: 'payload', type: 'jsonb' })
  public payload: object;

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
}
