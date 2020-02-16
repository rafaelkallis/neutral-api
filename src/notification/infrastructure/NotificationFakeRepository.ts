import { MemoryRepository } from 'common/infrastructure/MemoryRepository';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';
import { Id } from 'common/domain/value-objects/Id';

/**
 * Fake Notification Repository
 */
export class NotificationFakeRepository
  extends MemoryRepository<NotificationModel>
  implements NotificationRepository {
  /**
   *
   */
  public async findByOwnerId(ownerId: Id): Promise<NotificationModel[]> {
    return Array.from(this.models.values()).filter(entity =>
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
