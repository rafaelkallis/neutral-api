import { Repository } from 'common';
import { NotificationEntity } from 'notification/entities/notification.entity';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

/**
 * Notification Repository
 */
export interface NotificationRepository extends Repository<NotificationEntity> {
  /**
   * Finds notifications by user owner id.
   */
  findByOwnerId(ownerId: string): Promise<NotificationEntity[]>;
}
