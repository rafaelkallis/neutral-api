import { IsObject } from 'class-validator';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { UserModel } from 'user';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { NotificationAlreadyReadException } from 'notification/domain/exceptions/NotificationAlreadyReadException';
import { AggregateRoot } from 'common/domain/AggregateRoot';
import { NotificationReadEvent } from 'notification/domain/events/NotificationReadEvent';

/**
 * Notification Model
 */
export class NotificationModel extends AggregateRoot {
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
    if (this.isRead.value) {
      throw new NotificationAlreadyReadException();
    }
    this.isRead = NotificationIsRead.from(true);
    this.apply(new NotificationReadEvent(this));
  }

  /**
   *
   */
  public isOwner(user: UserModel): boolean {
    return this.ownerId === user.id;
  }
}
