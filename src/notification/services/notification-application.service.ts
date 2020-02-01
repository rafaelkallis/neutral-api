import { Injectable, Inject } from '@nestjs/common';
import { UserModel } from 'user';
import { NotificationDomainService } from 'notification/services/notification-domain.service';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'notification/repositories/notification.repository';
import { NotificationDto } from 'notification/dto/notification.dto';
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
