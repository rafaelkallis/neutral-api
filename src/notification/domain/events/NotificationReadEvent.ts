import { AbstractEvent } from 'event';
import { Notification } from 'notification/domain/Notification';

/**
 * Notification Event
 */
export class NotificationReadEvent extends AbstractEvent {
  public readonly notification: Notification;

  constructor(notification: Notification) {
    super();
    this.notification = notification;
  }
}
