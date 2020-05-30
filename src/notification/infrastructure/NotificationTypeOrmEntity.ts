import { Column } from 'typeorm';
import {
  AbstractTypeOrmEntity,
  TypeOrmEntity,
} from 'shared/infrastructure/TypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { NotificationTypeValue } from 'notification/domain/value-objects/NotificationType';

@TypeOrmEntity(Notification, 'notifications')
export class NotificationTypeOrmEntity extends AbstractTypeOrmEntity {
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
