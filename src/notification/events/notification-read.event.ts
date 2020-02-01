import { AbstractEvent } from 'event';
import { NotificationModel } from 'notification/notification.model';

/**
 * Notification Event
 */
export class NotificationReadEvent extends AbstractEvent {
  public readonly notification: NotificationModel;

  constructor(notification: NotificationModel) {
    super();
    this.notification = notification;
  }
}
