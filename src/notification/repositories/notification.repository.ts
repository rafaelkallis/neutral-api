import { Repository } from 'common';
import { NotificationModel } from 'notification/notification.model';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

/**
 * Notification Repository
 */
export interface NotificationRepository extends Repository<NotificationModel> {
  /**
   * Finds notifications by user owner id.
   */
  findByOwnerId(ownerId: string): Promise<NotificationModel[]>;
}
