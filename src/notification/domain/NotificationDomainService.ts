import { Injectable, Inject } from '@nestjs/common';
import { EventPublisherService, InjectEventPublisher } from 'event';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'notification/domain/NotificationRepository';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { NotificationAlreadyReadException } from 'notification/domain/exceptions/NotificationAlreadyReadException';
import { NotificationReadEvent } from 'notification/domain/events/NotificationReadEvent';

@Injectable()
export class NotificationDomainService {
  private readonly eventPublisher: EventPublisherService;
  private readonly notificationRepository: NotificationRepository;

  public constructor(
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @Inject(NOTIFICATION_REPOSITORY)
    notificationRepository: NotificationRepository,
  ) {
    this.eventPublisher = eventPublisher;
    this.notificationRepository = notificationRepository;
  }

  /**
   * Mark notification as read.
   */
  public async markRead(notification: NotificationModel): Promise<void> {
    if (notification.isRead) {
      throw new NotificationAlreadyReadException();
    }
    notification.isRead = true;
    await this.notificationRepository.persist(notification);
    await this.eventPublisher.publish(new NotificationReadEvent(notification));
  }
}
