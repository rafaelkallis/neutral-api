import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { Notification } from 'notification/domain/Notification';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * Fake Notification Repository
 */
export class NotificationFakeRepository
  extends MemoryRepository<NotificationId, Notification>
  implements NotificationRepository {
  /**
   *
   */
  public async findByOwnerId(ownerId: UserId): Promise<Notification[]> {
    return Array.from(this.models.values()).filter((entity) =>
      entity.ownerId.equals(ownerId),
    );
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new NotificationNotFoundException();
  }
}
