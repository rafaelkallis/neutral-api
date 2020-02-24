import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/DatabaseModule';
import { EventModule } from 'event/EventModule';
import { NotificationController } from 'notification/presentation/NotificationController';
import { NOTIFICATION_REPOSITORY } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmRepository } from 'notification/infrastructure/NotificationTypeOrmRepository';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { UserModule } from 'user/UserModule';
import { TokenModule } from 'token/TokenModule';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { NotificationTypeOrmEntityMapperService } from 'notification/infrastructure/NotificationTypeOrmEntityMapper';

/**
 * Notification Module
 */
@Module({
  imports: [DatabaseModule, EventModule, TokenModule, UserModule],
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
