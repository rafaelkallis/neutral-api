import { Injectable } from '@nestjs/common';
import { User } from 'user/domain/User';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { NotificationNotFoundException } from './exceptions/NotificationNotFoundException';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

@Injectable()
export class NotificationApplicationService {
  private readonly notificationRepository: NotificationRepository;
  private readonly domainEventBroker: DomainEventBroker;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    notificationRepository: NotificationRepository,
    domainEventBroker: DomainEventBroker,
    objectMapper: ObjectMapper,
  ) {
    this.notificationRepository = notificationRepository;
    this.domainEventBroker = domainEventBroker;
    this.objectMapper = objectMapper;
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
    return notifications.map((notification) =>
      this.objectMapper.map(notification, NotificationDto),
    );
  }

  /**
   * Mark notification as read.
   */
  public async markRead(
    authUser: User,
    rawNotificationId: string,
  ): Promise<NotificationDto> {
    const notificationId = NotificationId.from(rawNotificationId);
    const notification = await this.notificationRepository.findById(
      notificationId,
    );
    if (!notification) {
      throw new NotificationNotFoundException();
    }
    notification.assertOwner(authUser);
    notification.markRead();
    await this.notificationRepository.persist(notification);
    await this.domainEventBroker.publish(...notification.getDomainEvents());
    return this.objectMapper.map(notification, NotificationDto);
  }
}
