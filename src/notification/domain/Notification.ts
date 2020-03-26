import { IsObject } from 'class-validator';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { User } from 'user/domain/User';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { NotificationAlreadyReadException } from 'notification/domain/exceptions/NotificationAlreadyReadException';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { NotificationReadEvent } from 'notification/domain/events/NotificationReadEvent';
import { InsufficientPermissionsException } from 'shared/exceptions/insufficient-permissions.exception';

/**
 * Notification Model
 */
export class Notification extends AggregateRoot {
  public ownerId: Id;
  public type: NotificationType;
  public isRead: NotificationIsRead;

  @IsObject()
  public payload: object;

  public constructor(
    id: Id,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    ownerId: Id,
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
