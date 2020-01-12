import { FakeRepository, EntityNotFoundException } from 'common';
import { Notification } from 'notification/notification';
import { NotificationRepository } from 'notification/repositories/notification.repository';
import { NotificationEntity } from 'notification/entities/notification.entity';

/**
 * Fake Notification Repository
 */
export class FakeNotificationRepository
  extends FakeRepository<NotificationEntity>
  implements NotificationRepository {
  /**
   *
   */
  public async findByOwnerId(ownerId: string): Promise<NotificationEntity[]> {
    return Array.from(this.entities.values()).filter(
      entity => entity.ownerId === ownerId,
    );
  }
}
