import { TypeOrmRepository } from 'common';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { NotificationRepository } from 'notification/repositories/notification.repository';
import { NotificationEntity } from 'notification/entities/notification.entity';
import { NotificationModel } from 'notification/notification.model';
import { NotificationNotFoundException } from 'notification/exceptions/notification-not-found.exception';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class TypeOrmNotificationRepository
  extends TypeOrmRepository<NotificationModel, NotificationEntity>
  implements NotificationRepository {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, NotificationEntity);
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: string): Promise<NotificationModel[]> {
    const notificationEntities = await this.internalRepository.find({
      ownerId,
    });
    const notificationModel = notificationEntities.map(e => this.toModel(e));
    return notificationModel;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new NotificationNotFoundException();
  }

  /**
   *
   */
  protected toModel(notificationEntity: NotificationEntity): NotificationModel {
    return new NotificationModel(
      notificationEntity.id,
      notificationEntity.createdAt,
      notificationEntity.updatedAt,
      notificationEntity.ownerId,
      notificationEntity.type,
      notificationEntity.isRead,
      notificationEntity.payload,
    );
  }

  /**
   *
   */
  protected toEntity(notificationModel: NotificationModel): NotificationEntity {
    return new NotificationEntity(
      notificationModel.id,
      notificationModel.createdAt,
      notificationModel.updatedAt,
      notificationModel.ownerId,
      notificationModel.type,
      notificationModel.isRead,
      notificationModel.payload,
    );
  }
}
