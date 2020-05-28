import { Injectable } from '@nestjs/common';
import { Repository } from 'shared/domain/Repository';
import { ReadonlyNotification } from 'notification/domain/Notification';
import { Id } from 'shared/domain/value-objects/Id';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { NotificationRepositoryStrategy } from './NotificationRepositoryStrategy';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';

@Injectable()
export class NotificationRepository extends Repository<
  NotificationId,
  ReadonlyNotification
> {
  protected readonly strategy: NotificationRepositoryStrategy;

  public constructor(
    unitOfWork: UnitOfWork,
    strategy: NotificationRepositoryStrategy,
  ) {
    super(unitOfWork, strategy);
    this.strategy = strategy;
  }
  /**
   * Finds notifications by user owner id.
   */
  public async findByOwnerId(ownerId: Id): Promise<ReadonlyNotification[]> {
    const notifications = await this.strategy.findByOwnerId(ownerId);
    this.loadedModels(notifications);
    return notifications;
  }
}
