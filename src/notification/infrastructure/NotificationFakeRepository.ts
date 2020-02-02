import { FakeRepository } from 'common';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';

/**
 * Fake Notification Repository
 */
export class NotificationFakeRepository
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
