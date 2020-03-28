import { ModelMap, AbstractModelMap } from 'shared/model-mapper/ModelMap';
import { Notification } from 'notification/domain/Notification';
import { NotificationDto } from 'notification/application/dto/NotificationDto';

@ModelMap(Notification, NotificationDto)
export class NotificationDtoMap extends AbstractModelMap<
  Notification,
  NotificationDto
> {
  public map(notification: Notification): NotificationDto {
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
