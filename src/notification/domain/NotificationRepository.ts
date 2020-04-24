import { Repository } from 'shared/domain/Repository';
import { ReadonlyNotification } from 'notification/domain/Notification';
import { Id } from 'shared/domain/value-objects/Id';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';

/**
 * Notification Repository
 */
export abstract class NotificationRepository extends Repository<
  NotificationId,
  ReadonlyNotification
> {
  /**
   * Finds notifications by user owner id.
   */
  public abstract findByOwnerId(ownerId: Id): Promise<ReadonlyNotification[]>;
}
