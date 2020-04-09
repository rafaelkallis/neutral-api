import { Module } from '@nestjs/common';
import { NotificationController } from 'notification/presentation/NotificationController';
import { TypeOrmNotificationRepository } from 'notification/infrastructure/NotificationTypeOrmRepository';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { UserModule } from 'user/UserModule';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { SharedModule } from 'shared/SharedModule';
import { NotificationDtoMap } from 'notification/application/NotificationDtoMap';
import {
  NotificationTypeOrmEntityMap,
  ReverseNotificationTypeOrmEntityMap,
} from 'notification/infrastructure/NotificationTypeOrmEntityMap';
import { NotificationRepository } from './domain/NotificationRepository';

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
      provide: NotificationRepository,
      useClass: TypeOrmNotificationRepository,
    },
  ],
  exports: [NotificationRepository],
})
export class NotificationModule {}
