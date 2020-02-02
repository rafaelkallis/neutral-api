import { TypeOrmRepository } from 'common';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';
import { NotificationTypeOrmEntityMapperService } from 'notification/infrastructure/NotificationTypeOrmEntityMapper';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class NotificationTypeOrmRepository
  extends TypeOrmRepository<NotificationModel, NotificationTypeOrmEntity>
  implements NotificationRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    notificationTypeOrmEntityMapper: NotificationTypeOrmEntityMapperService,
  ) {
    super(
      databaseClient,
      NotificationTypeOrmEntity,
      notificationTypeOrmEntityMapper,
    );
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: string): Promise<NotificationModel[]> {
    const notificationEntities = await this.internalRepository.find({
      ownerId,
    });
    const notificationModel = notificationEntities.map(e =>
      this.entityMapper.toModel(e),
    );
    return notificationModel;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new NotificationNotFoundException();
  }
}
