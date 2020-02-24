import { DomainEvent } from 'event/domain/DomainEvent';
import { Notification } from 'notification/domain/Notification';

/**
 * Notification Event
 */
export class NotificationReadEvent extends DomainEvent {
  public readonly notification: Notification;

  constructor(notification: Notification) {
    super();
    this.notification = notification;
  }
}
