import { Notification } from 'notification/domain/Notification';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { UserId } from 'user/domain/value-objects/UserId';
import { Injectable } from '@nestjs/common';

@Injectable()
@ObjectMap.mapFromTo(Notification, NotificationTypeOrmEntity)
export class NotificationTypeOrmEntityMap extends ObjectMap<
  Notification,
  NotificationTypeOrmEntity
> {
  protected doMap(notificationModel: Notification): NotificationTypeOrmEntity {
    return new NotificationTypeOrmEntity(
      notificationModel.id.value,
      notificationModel.createdAt.value,
      notificationModel.updatedAt.value,
      notificationModel.ownerId.value,
      notificationModel.type.value,
      notificationModel.isRead.value,
      notificationModel.payload,
    );
  }
}

@Injectable()
@ObjectMap.mapFromTo(NotificationTypeOrmEntity, Notification)
export class ReverseNotificationTypeOrmEntityMap extends ObjectMap<
  NotificationTypeOrmEntity,
  Notification
> {
  protected doMap(notificationEntity: NotificationTypeOrmEntity): Notification {
    return Notification.of(
      NotificationId.from(notificationEntity.id),
      CreatedAt.from(notificationEntity.createdAt),
      UpdatedAt.from(notificationEntity.updatedAt),
      UserId.from(notificationEntity.ownerId),
      NotificationType.from(notificationEntity.type),
      NotificationIsRead.from(notificationEntity.isRead),
      notificationEntity.payload,
    );
  }
}
