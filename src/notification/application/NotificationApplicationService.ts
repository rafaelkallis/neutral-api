import { Injectable, Inject } from '@nestjs/common';
import { UserModel } from 'user';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'notification/domain/NotificationRepository';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { InsufficientPermissionsException } from 'common';
import { Id } from 'common/domain/value-objects/Id';
import { EventPublisherService } from 'event';
import { EVENT_PUBLISHER } from 'event/constants';

@Injectable()
export class NotificationApplicationService {
  private readonly notificationRepository: NotificationRepository;
  private readonly eventPublisher: EventPublisherService;

  public constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    notificationRepository: NotificationRepository,
    @Inject(EVENT_PUBLISHER)
    eventPublisher: EventPublisherService,
  ) {
    this.notificationRepository = notificationRepository;
    this.eventPublisher = eventPublisher;
  }

  /**
   * Get notification of authenticated user.
   */
  public async getNotificationsByAuthUser(
    authUser: UserModel,
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
  public async markRead(authUser: UserModel, id: string): Promise<void> {
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
