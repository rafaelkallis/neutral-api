import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from 'user/entities/user.entity';
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
    authUser: UserEntity,
  ): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.findByOwnerId(
      authUser.id,
    );
    return notifications.map(notification =>
      NotificationDto.fromEntity(notification),
    );
  }

  /**
   * Mark notification as read.
   */
  public async markRead(authUser: UserEntity, id: string): Promise<void> {
    const notification = await this.notificationRepository.findOne(id);
    if (!notification.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    await this.notificationDomainService.markRead(notification);
  }
}
