import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserId } from 'user/domain/value-objects/UserId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Injectable, Type } from '@nestjs/common';
import { TypeOrmRepositoryStrategy } from 'shared/typeorm/TypeOrmRepositoryStrategy';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class TypeOrmNotificationRepositoryStrategy extends TypeOrmRepositoryStrategy<
  NotificationId,
  Notification,
  NotificationTypeOrmEntity
> {
  public constructor(objectMapper: ObjectMapper, typeOrmClient: TypeOrmClient) {
    super(typeOrmClient.entityManager, objectMapper);
  }

  protected getModelType(): Type<Notification> {
    throw Notification;
  }
  protected getEntityType(): Type<NotificationTypeOrmEntity> {
    throw NotificationTypeOrmEntity;
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: UserId): Promise<Notification[]> {
    const notificationEntities = await this.entityManager
      .getRepository(NotificationTypeOrmEntity)
      .find({ ownerId: ownerId.value });
    const notificationModels = this.objectMapper.mapArray(
      notificationEntities,
      Notification,
    );
    return notificationModels;
  }
}
