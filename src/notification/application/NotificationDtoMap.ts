import { ObjectMap, AbstractObjectMap } from 'shared/object-mapper/ObjectMap';
import { Notification } from 'notification/domain/Notification';
import { NotificationDto } from 'notification/application/dto/NotificationDto';

@ObjectMap(Notification, NotificationDto)
export class NotificationDtoMap extends AbstractObjectMap<
  Notification,
  NotificationDto
> {
  protected innerMap(notification: Notification): NotificationDto {
    return new NotificationDto(
      notification.id.value,
      notification.createdAt.value,
      notification.updatedAt.value,
      notification.type.value,
      notification.isRead.value,
      notification.payload,
    );
  }
}
