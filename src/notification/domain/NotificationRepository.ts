import { Repository } from 'shared/domain/Repository';
import { Notification } from 'notification/domain/Notification';
import { Id } from 'shared/domain/value-objects/Id';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';

/**
 * Notification Repository
 */
@Repository.register(Notification)
export abstract class NotificationRepository extends Repository<
  NotificationId,
  Notification
> {
  /**
   * Finds notifications by user owner id.
   */
  public abstract findByOwnerId(ownerId: Id): Promise<Notification[]>;
}
