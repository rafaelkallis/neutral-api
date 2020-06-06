import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { Notification } from 'notification/domain/Notification';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { Injectable, Type } from '@nestjs/common';

@Injectable()
export class NotificationDtoMap extends ObjectMap<
  Notification,
  NotificationDto
> {
  protected doMap(notification: Notification): NotificationDto {
    return new NotificationDto(
      notification.id.value,
      notification.createdAt.value,
      notification.updatedAt.value,
      notification.type.value,
      notification.isRead.value,
      notification.payload,
    );
  }

  public getSourceClass(): Type<Notification> {
    return Notification;
  }

  public getTargetClass(): Type<NotificationDto> {
    return NotificationDto;
  }
}
