import { Injectable } from '@nestjs/common';
import { ReadonlyNotification } from 'notification/domain/Notification';
import { Id } from 'shared/domain/value-objects/Id';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { RepositoryStrategy } from 'shared/domain/RepositoryStrategy';

@Injectable()
export abstract class NotificationRepositoryStrategy extends RepositoryStrategy<
  NotificationId,
  ReadonlyNotification
> {
  /**
   * Finds notifications by user owner id.
   */
  public abstract findByOwnerId(ownerId: Id): Promise<ReadonlyNotification[]>;
}
