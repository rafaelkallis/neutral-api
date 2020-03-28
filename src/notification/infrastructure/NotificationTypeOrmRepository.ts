import {
  AbstractTypeOrmRepository,
  TypeOrmRepository,
} from 'shared/infrastructure/TypeOrmRepository';
import { DatabaseClientService } from 'shared/database/DatabaseClientService';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { NotificationNotFoundException } from 'notification/application/exceptions/NotificationNotFoundException';
import { Id } from 'shared/domain/value-objects/Id';
import { ModelMapper } from 'shared/model-mapper/ModelMapper';

/**
 * TypeOrm Notification Repository
 */
@TypeOrmRepository(Notification, NotificationTypeOrmEntity)
export class NotificationTypeOrmRepository
  extends AbstractTypeOrmRepository<Notification, NotificationTypeOrmEntity>
  implements NotificationRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    modelMapper: ModelMapper,
  ) {
    super(databaseClient, modelMapper);
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
