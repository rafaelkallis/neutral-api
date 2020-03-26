import { Repository } from 'shared/domain/Repository';
import { Notification } from 'notification/domain/Notification';
import { Id } from 'shared/domain/value-objects/Id';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

/**
 * Notification Repository
 */
export interface NotificationRepository extends Repository<Notification> {
  /**
   * Finds notifications by user owner id.
   */
  findByOwnerId(ownerId: Id): Promise<Notification[]>;
}
