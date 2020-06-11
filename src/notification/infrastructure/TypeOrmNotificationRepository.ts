import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { Notification } from 'notification/domain/Notification';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { UserId } from 'user/domain/value-objects/UserId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'shared/typeorm/TypeOrmRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class TypeOrmNotificationRepository extends NotificationRepository {
  private readonly entityManager: EntityManager;
  private readonly typeOrmRepository: TypeOrmRepository<
    NotificationTypeOrmEntity,
    NotificationId,
    Notification
  >;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    objectMapper: ObjectMapper,
    typeOrmClient: TypeOrmClient,
    typeOrmRepository: TypeOrmRepository<
      NotificationTypeOrmEntity,
      NotificationId,
      Notification
    >,
  ) {
    super();
    this.objectMapper = objectMapper;
    this.entityManager = typeOrmClient.entityManager;
    this.typeOrmRepository = typeOrmRepository;
  }

  public async findPage(
    afterId?: NotificationId | undefined,
  ): Promise<Notification[]> {
    return this.typeOrmRepository.findPage(
      NotificationTypeOrmEntity,
      Notification,
      afterId,
    );
  }

  public async findById(id: NotificationId): Promise<Notification | undefined> {
    return this.typeOrmRepository.findById(
      NotificationTypeOrmEntity,
      Notification,
      id,
    );
  }

  public async findByIds(
    ids: NotificationId[],
  ): Promise<(Notification | undefined)[]> {
    return this.typeOrmRepository.findByIds(
      NotificationTypeOrmEntity,
      Notification,
      ids,
    );
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

  protected async doPersist(...models: Notification[]): Promise<void> {
    return this.typeOrmRepository.persist(NotificationTypeOrmEntity, ...models);
  }
}
