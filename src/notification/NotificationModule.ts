import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database';
import { EventModule } from 'event';
import { NotificationController } from 'notification/NotificationController';
import { NOTIFICATION_REPOSITORY } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmRepository } from 'notification/infrastructure/NotificationTypeOrmRepository';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { NotificationDomainService } from 'notification/domain/NotificationDomainService';
import { UserModule } from 'user/UserModule';
import { TokenModule } from 'token';
import { NotificationFactoryService } from 'notification/application/NotificationFactoryService';
import { NotificationTypeOrmEntityMapperService } from 'notification/infrastructure/NotificationTypeOrmEntityMapper';

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
    NotificationTypeOrmEntityMapperService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationTypeOrmRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationModule {}
