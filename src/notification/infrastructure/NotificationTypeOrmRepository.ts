import { TypeOrmRepository } from 'common';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class NotificationTypeOrmRepository
  extends TypeOrmRepository<NotificationModel, NotificationTypeOrmEntity>
  implements NotificationRepository {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, NotificationTypeOrmEntity);
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
  protected toModel(
    notificationEntity: NotificationTypeOrmEntity,
  ): NotificationModel {
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
  protected toEntity(
    notificationModel: NotificationModel,
  ): NotificationTypeOrmEntity {
    return new NotificationTypeOrmEntity(
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
