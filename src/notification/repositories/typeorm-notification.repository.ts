import { TypeOrmRepository } from 'common';
import { Injectable } from '@nestjs/common';
import { DatabaseService, InjectDatabase } from 'database';
import { NotificationRepository } from 'notification/repositories/notification.repository';
import { NotificationEntity } from 'notification/entities/notification.entity';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class TypeOrmNotificationRepository
  extends TypeOrmRepository<NotificationEntity>
  implements NotificationRepository {
  /**
   *
   */
  public constructor(@InjectDatabase() database: DatabaseService) {
    super(database, NotificationEntity);
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: string): Promise<NotificationEntity[]> {
    return this.getInternalRepository().find({ ownerId });
  }
}
