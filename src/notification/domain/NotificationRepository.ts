import { Repository } from 'common/domain/Repository';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { Id } from 'common/domain/value-objects/Id';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

/**
 * Notification Repository
 */
export interface NotificationRepository extends Repository<NotificationModel> {
  /**
   * Finds notifications by user owner id.
   */
  findByOwnerId(ownerId: Id): Promise<NotificationModel[]>;
}
