import { Notification } from 'notification/domain/Notification';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { ObjectMap, AbstractObjectMap } from 'shared/object-mapper/ObjectMap';

@ObjectMap(Notification, NotificationTypeOrmEntity)
export class NotificationTypeOrmEntityMap extends AbstractObjectMap<
  Notification,
  NotificationTypeOrmEntity
> {
  protected innerMap(
    notificationModel: Notification,
  ): NotificationTypeOrmEntity {
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

@ObjectMap(NotificationTypeOrmEntity, Notification)
export class ReverseNotificationTypeOrmEntityMap extends AbstractObjectMap<
  NotificationTypeOrmEntity,
  Notification
> {
  protected innerMap(
    notificationEntity: NotificationTypeOrmEntity,
  ): Notification {
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
}