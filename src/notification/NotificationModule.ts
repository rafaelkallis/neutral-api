import { Module } from '@nestjs/common';
import { NotificationController } from 'notification/presentation/NotificationController';
import { NOTIFICATION_REPOSITORY } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmRepository } from 'notification/infrastructure/NotificationTypeOrmRepository';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { UserModule } from 'user/UserModule';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { NotificationTypeOrmEntityMapperService } from 'notification/infrastructure/NotificationTypeOrmEntityMapper';
import { SharedModule } from 'shared/SharedModule';

/**
 * Notification Module
 */
@Module({
  imports: [SharedModule, UserModule],
  controllers: [NotificationController],
  providers: [
    NotificationApplicationService,
    NotificationFactoryService,
    NotificationTypeOrmEntityMapperService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationTypeOrmRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationModule {}
