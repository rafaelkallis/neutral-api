import { AbstractEvent } from 'event';
import { NotificationEntity } from 'notification/entities/notification.entity';

/**
 * Notification Event
 */
export class NotificationReadEvent extends AbstractEvent {
  public readonly notification: NotificationEntity;

  constructor(notification: NotificationEntity) {
    super();
    this.notification = notification;
  }
}
