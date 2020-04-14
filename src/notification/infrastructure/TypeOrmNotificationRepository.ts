import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { UserId } from 'user/domain/value-objects/UserId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Repository } from 'shared/domain/Repository';
import { Injectable } from '@nestjs/common';

/**
 * TypeOrm Notification Repository
 */
@Injectable()
export class TypeOrmNotificationRepository extends NotificationRepository {
  private readonly typeOrmClient: TypeOrmClient;
  private readonly typeOrmRepository: Repository<NotificationId, Notification>;
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper, typeOrmClient: TypeOrmClient) {
    super();
    this.typeOrmClient = typeOrmClient;
    this.typeOrmRepository = typeOrmClient.createRepository(
      Notification,
      NotificationTypeOrmEntity,
    );
    this.objectMapper = objectMapper;
  }

  public findPage(
    afterId?: NotificationId | undefined,
  ): Promise<Notification[]> {
    return this.typeOrmRepository.findPage(afterId);
  }

  public findById(id: NotificationId): Promise<Notification | undefined> {
    return this.typeOrmRepository.findById(id);
  }

  public findByIds(
    ids: NotificationId[],
  ): Promise<(Notification | undefined)[]> {
    return this.typeOrmRepository.findByIds(ids);
  }

  public exists(id: NotificationId): Promise<boolean> {
    return this.typeOrmRepository.exists(id);
  }

  protected doPersist(...models: Notification[]): Promise<void> {
    return this.typeOrmRepository.persist(...models);
  }

  public delete(...models: Notification[]): Promise<void> {
    return this.typeOrmRepository.delete(...models);
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
