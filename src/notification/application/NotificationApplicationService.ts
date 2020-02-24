import { Injectable, Inject } from '@nestjs/common';
import { User } from 'user/domain/User';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'notification/domain/NotificationRepository';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { Id } from 'common/domain/value-objects/Id';
import { InsufficientPermissionsException } from 'common/exceptions/insufficient-permissions.exception';
import {
  InjectEventPublisher,
  EventPublisherService,
} from 'event/publisher/event-publisher.service';

@Injectable()
export class NotificationApplicationService {
  private readonly notificationRepository: NotificationRepository;
  private readonly eventPublisher: EventPublisherService;

  public constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    notificationRepository: NotificationRepository,
    @InjectEventPublisher()
    eventPublisher: EventPublisherService,
  ) {
    this.notificationRepository = notificationRepository;
    this.eventPublisher = eventPublisher;
  }

  /**
   * Get notification of authenticated user.
   */
  public async getNotificationsByAuthUser(
    authUser: User,
  ): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.findByOwnerId(
      authUser.id,
    );
    return notifications.map(notification =>
      NotificationDto.fromModel(notification),
    );
  }

  /**
   * Mark notification as read.
   */
  public async markRead(authUser: User, id: string): Promise<void> {
    const notification = await this.notificationRepository.findById(
      Id.from(id),
    );
    if (!notification.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    notification.markRead();
    await this.notificationRepository.persist(notification);
    await this.eventPublisher.publish(...notification.getDomainEvents());
  }
}
