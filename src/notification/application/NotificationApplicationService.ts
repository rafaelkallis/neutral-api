import { Injectable, Inject } from '@nestjs/common';
import { UserModel } from 'user';
import { NotificationDomainService } from 'notification/domain/NotificationDomainService';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'notification/domain/NotificationRepository';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { InsufficientPermissionsException } from 'common';

@Injectable()
export class NotificationApplicationService {
  private readonly notificationRepository: NotificationRepository;
  private readonly notificationDomainService: NotificationDomainService;

  public constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    notificationRepository: NotificationRepository,
    notificationDomainService: NotificationDomainService,
  ) {
    this.notificationRepository = notificationRepository;
    this.notificationDomainService = notificationDomainService;
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
    const notification = await this.notificationRepository.findById(id);
    if (!notification.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    await this.notificationDomainService.markRead(notification);
  }
}
