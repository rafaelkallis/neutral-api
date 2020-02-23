import { Column, Entity } from 'typeorm';
import { TypeOrmEntity } from 'common/infrastructure/TypeOrmEntity';
import { NotificationTypeValue } from 'notification/domain/value-objects/NotificationType';

/**
 * Notification TypeOrm Entity
 */
@Entity('notifications')
export class NotificationTypeOrmEntity extends TypeOrmEntity {
  @Column({ name: 'owner_id' })
  public ownerId: string;

  @Column({ name: 'type', type: 'enum', enum: NotificationTypeValue })
  public type: NotificationTypeValue;

  @Column({ name: 'is_read' })
  public isRead: boolean;

  @Column({ name: 'payload', type: 'jsonb' })
  public payload: object;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    ownerId: string,
    type: NotificationTypeValue,
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
