import { Injectable, Inject } from '@nestjs/common';
import { EventPublisher, InjectEventPublisher } from 'event';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'notification/repositories/notification.repository';
import { NotificationEntity } from 'notification/entities/notification.entity';
import { NotificationReadEvent } from 'notification/events/notification-read.event';
import { NotificationAlreadyReadException } from 'notification/exceptions/notification-already-read.exception';

@Injectable()
export class NotificationDomainService {
  private readonly eventPublisher: EventPublisher;
  private readonly notificationRepository: NotificationRepository;

  public constructor(
    @InjectEventPublisher() eventPublisher: EventPublisher,
    @Inject(NOTIFICATION_REPOSITORY)
    notificationRepository: NotificationRepository,
  ) {
    this.eventPublisher = eventPublisher;
    this.notificationRepository = notificationRepository;
  }

  /**
   * Mark notification as read.
   */
  public async markRead(notification: NotificationEntity): Promise<void> {
    if (notification.isRead) {
      throw new NotificationAlreadyReadException();
    }
    notification.isRead = true;
    await this.notificationRepository.persist(notification);
    await this.eventPublisher.publish(new NotificationReadEvent(notification));
  }
}
