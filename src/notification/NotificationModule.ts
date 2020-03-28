import { Module } from '@nestjs/common';
import { NotificationController } from 'notification/presentation/NotificationController';
import { NOTIFICATION_REPOSITORY } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmRepository } from 'notification/infrastructure/NotificationTypeOrmRepository';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { UserModule } from 'user/UserModule';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { SharedModule } from 'shared/SharedModule';
import { NotificationDtoMap } from 'notification/application/NotificationDtoMap';
import {
  NotificationTypeOrmEntityMap,
  ReverseNotificationTypeOrmEntityMap,
} from './infrastructure/NotificationTypeOrmEntityMap';

/**
 * Notification Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [NotificationController],
  providers: [
    NotificationApplicationService,
    NotificationFactoryService,
    NotificationDtoMap,
    NotificationTypeOrmEntityMap,
    ReverseNotificationTypeOrmEntityMap,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationTypeOrmRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationModule {}
