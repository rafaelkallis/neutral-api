import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { NotificationModel } from 'notification';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';

/**
 * Notification TypeOrm Entity Mapper
 */
@Injectable()
export class NotificationTypeOrmEntityMapperService
  implements
    TypeOrmEntityMapperService<NotificationModel, NotificationTypeOrmEntity> {
  /**
   *
   */
  public toModel(
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
  public toEntity(
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
