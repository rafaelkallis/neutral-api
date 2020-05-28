import { Module } from '@nestjs/common';
import { NotificationController } from 'notification/presentation/NotificationController';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { UserModule } from 'user/UserModule';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { SharedModule } from 'shared/SharedModule';
import { NotificationDtoMap } from 'notification/application/NotificationDtoMap';
import {
  NotificationTypeOrmEntityMap,
  ReverseNotificationTypeOrmEntityMap,
} from 'notification/infrastructure/NotificationTypeOrmEntityMap';
import { NotificationDomainEventHandlers } from 'notification/application/NotificationDomainEventHandlers';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationRepositoryStrategy } from 'notification/domain/NotificationRepositoryStrategy';
import { TypeOrmNotificationRepositoryStrategy } from 'notification/infrastructure/TypeOrmNotificationRepositoryStrategy';

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
    NotificationRepository,
    {
      provide: NotificationRepositoryStrategy,
      useClass: TypeOrmNotificationRepositoryStrategy,
    },
    NotificationDomainEventHandlers,
  ],
  exports: [NotificationRepository],
})
export class NotificationModule {}
