import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database';
import { EventModule } from 'event';
import { NotificationController } from 'notification/notification.controller';
import { NOTIFICATION_REPOSITORY } from 'notification/repositories/notification.repository';
import { TypeOrmNotificationRepository } from 'notification/repositories/typeorm-notification.repository';
import { NotificationApplicationService } from 'notification/services/notification-application.service';
import { NotificationDomainService } from 'notification/services/notification-domain.service';
import { UserModule } from 'user/user.module';
import { TokenModule } from 'token';
import { NotificationFactoryService } from 'notification/services/notification-factory.service';

/**
 * Notification Module
 */
@Module({
  imports: [DatabaseModule, EventModule, TokenModule, UserModule],
  controllers: [NotificationController],
  providers: [
    NotificationApplicationService,
    NotificationDomainService,
    NotificationFactoryService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: TypeOrmNotificationRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationModule {}
