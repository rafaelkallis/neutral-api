import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Notification } from 'notification/domain/Notification';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * Notification Event
 */
@DomainEventKey('notification.read')
export class NotificationReadEvent extends DomainEvent {
  public readonly notification: Notification;

  constructor(notification: Notification) {
    super();
    this.notification = notification;
  }
}
