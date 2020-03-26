import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { Notification } from 'notification/domain/Notification';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';
import { Id } from 'shared/domain/value-objects/Id';

/**
 * Fake Notification Repository
 */
export class NotificationFakeRepository extends MemoryRepository<Notification>
  implements NotificationRepository {
  /**
   *
   */
  public async findByOwnerId(ownerId: Id): Promise<Notification[]> {
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
