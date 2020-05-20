import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserId } from 'user/domain/value-objects/UserId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Injectable } from '@nestjs/common';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class TypeOrmNotificationRepository extends NotificationRepository {
  private readonly typeOrmClient: TypeOrmClient;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    unitOfWork: UnitOfWork,
    objectMapper: ObjectMapper,
    typeOrmClient: TypeOrmClient,
  ) {
    super(
      unitOfWork,
      typeOrmClient.createRepositoryStrategy(
        Notification,
        NotificationTypeOrmEntity,
      ),
    );
    this.typeOrmClient = typeOrmClient;
    this.objectMapper = objectMapper;
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: UserId): Promise<Notification[]> {
    const notificationEntities = await this.typeOrmClient.entityManager
      .getRepository(NotificationTypeOrmEntity)
      .find({ ownerId: ownerId.value });
    const notificationModels = this.objectMapper.mapArray(
      notificationEntities,
      Notification,
    );
    return notificationModels;
  }
}
