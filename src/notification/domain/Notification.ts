import { IsObject } from 'class-validator';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { User } from 'user/domain/User';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { NotificationAlreadyReadException } from 'notification/domain/exceptions/NotificationAlreadyReadException';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { NotificationReadEvent } from 'notification/domain/events/NotificationReadEvent';
import { InsufficientPermissionsException } from 'shared/exceptions/insufficient-permissions.exception';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * Notification Model
 */
export class Notification extends AggregateRoot<NotificationId> {
  public ownerId: UserId;
  public type: NotificationType;
  public isRead: NotificationIsRead;

  @IsObject()
  public payload: object;

  public constructor(
    id: NotificationId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    ownerId: UserId,
    type: NotificationType,
    isRead: NotificationIsRead,
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
  public markRead(): void {
    this.assertNotRead();
    this.isRead = NotificationIsRead.from(true);
    this.apply(new NotificationReadEvent(this));
  }

  /**
   *
   */
  public assertOwner(user: User): void {
    if (!this.ownerId.equals(user.id)) {
      throw new InsufficientPermissionsException();
    }
  }

  public assertNotRead(): void {
    if (this.isRead.value) {
      throw new NotificationAlreadyReadException();
    }
  }
}
