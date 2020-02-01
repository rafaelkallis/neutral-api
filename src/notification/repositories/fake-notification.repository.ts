import { FakeRepository } from 'common';
import { NotificationRepository } from 'notification/repositories/notification.repository';
import { NotificationModel } from 'notification/notification.model';
import { NotificationNotFoundException } from 'notification/exceptions/notification-not-found.exception';

/**
 * Fake Notification Repository
 */
export class FakeNotificationRepository
  extends FakeRepository<NotificationModel>
  implements NotificationRepository {
  /**
   *
   */
  public async findByOwnerId(ownerId: string): Promise<NotificationModel[]> {
    return Array.from(this.entities.values()).filter(
      entity => entity.ownerId === ownerId,
    );
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new NotificationNotFoundException();
  }
}
