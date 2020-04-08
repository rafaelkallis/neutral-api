import {
  AbstractTypeOrmRepository,
  TypeOrmRepository,
} from 'shared/infrastructure/TypeOrmRepository';
import { DatabaseClientService } from 'shared/database/DatabaseClientService';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * TypeOrm Notification Repository
 */
@TypeOrmRepository(Notification, NotificationTypeOrmEntity)
export class NotificationTypeOrmRepository
  extends AbstractTypeOrmRepository<
    NotificationId,
    Notification,
    NotificationTypeOrmEntity
  >
  implements NotificationRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    modelMapper: ObjectMapper,
  ) {
    super(databaseClient, modelMapper);
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: UserId): Promise<Notification[]> {
    const notificationEntities = await this.entityManager
      .getRepository(NotificationTypeOrmEntity)
      .find({
        ownerId: ownerId.value,
      });
    const notificationModel = notificationEntities.map((e) =>
      this.modelMapper.map(e, Notification),
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
