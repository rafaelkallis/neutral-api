import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { NotificationModel } from 'notification';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';

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
      Id.from(notificationEntity.id),
      CreatedAt.from(notificationEntity.createdAt),
      UpdatedAt.from(notificationEntity.updatedAt),
      Id.from(notificationEntity.ownerId),
      NotificationType.from(notificationEntity.type),
      NotificationIsRead.from(notificationEntity.isRead),
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
      notificationModel.id.value,
      notificationModel.createdAt.value,
      notificationModel.updatedAt.value,
      notificationModel.ownerId.value,
      notificationModel.type.toValue(),
      notificationModel.isRead.value,
      notificationModel.payload,
    );
  }
}
