import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'common/infrastructure/TypeOrmRepository';
import { DatabaseClientService } from 'database/DatabaseClientService';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';
import { NotificationTypeOrmEntityMapperService } from 'notification/infrastructure/NotificationTypeOrmEntityMapper';
import { ObjectType } from 'typeorm';
import { Id } from 'common/domain/value-objects/Id';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class NotificationTypeOrmRepository
  extends TypeOrmRepository<Notification, NotificationTypeOrmEntity>
  implements NotificationRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    notificationTypeOrmEntityMapper: NotificationTypeOrmEntityMapperService,
  ) {
    super(databaseClient, notificationTypeOrmEntityMapper);
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: Id): Promise<Notification[]> {
    const notificationEntities = await this.entityManager
      .getRepository(NotificationTypeOrmEntity)
      .find({
        ownerId: ownerId.value,
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

  /**
   *
   */
  protected getEntityType(): ObjectType<NotificationTypeOrmEntity> {
    return NotificationTypeOrmEntity;
  }
}
