import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'shared/infrastructure/TypeOrmEntityMapperService';
import { Notification } from 'notification/domain/Notification';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';

/**
 * Notification TypeOrm Entity Mapper
 */
@Injectable()
export class NotificationTypeOrmEntityMapperService
  implements
    TypeOrmEntityMapperService<Notification, NotificationTypeOrmEntity> {
  /**
   *
   */
  public toModel(notificationEntity: NotificationTypeOrmEntity): Notification {
    return new Notification(
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
  public toEntity(notification: Notification): NotificationTypeOrmEntity {
    return new NotificationTypeOrmEntity(
      notification.id.value,
      notification.createdAt.value,
      notification.updatedAt.value,
      notification.ownerId.value,
      notification.type.value,
      notification.isRead.value,
      notification.payload,
    );
  }
}
