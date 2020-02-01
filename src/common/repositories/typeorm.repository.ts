import {
  Repository as InternalRepository,
  ObjectType,
  EntityManager,
} from 'typeorm';
import { Repository } from 'common/repositories/repository';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { DatabaseClientService } from 'database';
import ObjectID from 'bson-objectid';
import { AbstractModel } from 'common/abstract.model';

/**
 * TypeOrm Repository
 */
export abstract class TypeOrmRepository<
  TModel extends AbstractModel,
  TEntity extends AbstractEntity
> implements Repository<TModel> {
  protected readonly entityManager: EntityManager;
  protected readonly internalRepository: InternalRepository<TEntity>;

  public constructor(
    databaseClient: DatabaseClientService,
    Entity: ObjectType<TEntity>,
  ) {
    this.entityManager = databaseClient.getEntityManager();
    this.internalRepository = this.entityManager.getRepository(Entity);
  }

  /**
   *
   */
  public createId(): string {
    return new ObjectID().toHexString();
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    for (const model of models) {
      model.validate();
    }
    const entities = models.map(m => this.toEntity(m));
    await this.entityManager.save(entities);
  }

  /**
   *
   */
  public async findPage(afterId?: string): Promise<TModel[]> {
    let builder = this.internalRepository
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId });
    }
    const entities = await builder.getMany();
    const models = entities.map(e => this.toModel(e));
    return models;
  }

  /**
   *
   */
  public async findById(id: string): Promise<TModel> {
    const entity = await this.internalRepository.findOne(id);
    if (!entity) {
      this.throwEntityNotFoundException();
    }
    const model = this.toModel(entity);
    return model;
  }

  /**
   *
   */
  public async findByIds(ids: string[]): Promise<TModel[]> {
    const entities = await this.internalRepository.findByIds(ids);
    if (ids.length !== entities.length) {
      this.throwEntityNotFoundException();
    }
    const models = entities.map(e => this.toModel(e));
    return models;
  }

  /**
   *
   */
  public async exists(id: string): Promise<boolean> {
    const entity = await this.internalRepository.findOne(id);
    return Boolean(entity);
  }

  /**
   *
   */
  public async delete(...models: TModel[]): Promise<void> {
    const ids = models.map(m => m.id);
    await this.internalRepository.delete(ids);
  }

  /**
   * Throw entity-specific not-found exception
   */
  protected abstract throwEntityNotFoundException(): never;

  /**
   * Used to map a domain model to a persistence entity.
   */
  protected abstract toEntity(model: TModel): TEntity;

  /**
   * Used to map a persistence entity to a domain model.
   */
  protected abstract toModel(entity: TEntity): TModel;
}
