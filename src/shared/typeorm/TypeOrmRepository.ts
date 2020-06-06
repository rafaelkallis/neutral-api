import { Id } from 'shared/domain/value-objects/Id';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { Repository } from 'shared/domain/Repository';
import { InternalServerErrorException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { Observable } from 'shared/domain/Observer';
import { Class } from 'shared/domain/Class';

export class TypeOrmRepository<
  TId extends Id,
  TModel extends AggregateRoot<TId>,
  TEntity extends TypeOrmEntity
> extends Repository<TId, TModel> {
  protected readonly modelClass: Class<TModel>;
  protected readonly entityClass: Class<TEntity>;
  protected readonly entityManager: EntityManager;
  protected readonly objectMapper: ObjectMapper;

  public constructor(
    modelClass: Class<TModel>,
    entityClass: Class<TEntity>,
    entityManager: EntityManager,
    modelMapper: ObjectMapper,
  ) {
    super();
    this.modelClass = modelClass;
    this.entityClass = entityClass;
    this.entityManager = entityManager;
    this.objectMapper = modelMapper;
  }

  public get persistedModels(): Observable<TModel> {
    throw new InternalServerErrorException();
  }

  public get deletedModels(): Observable<TModel> {
    throw new InternalServerErrorException();
  }

  /**
   *
   */
  public async findPage(afterId?: TId): Promise<TModel[]> {
    let builder = this.entityManager
      .getRepository(this.entityClass)
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId: afterId.value });
    }
    const entities = await builder.getMany();
    const models = this.objectMapper.mapArray(entities, this.modelClass);
    return models;
  }

  /**
   *
   */
  public async findById(id: TId): Promise<TModel | undefined> {
    const entity = await this.entityManager
      .getRepository(this.entityClass)
      .findOne(id.value);
    if (entity === undefined) {
      return undefined;
    }
    return this.objectMapper.map(entity, this.modelClass);
  }

  /**
   *
   */
  public async findByIds(ids: TId[]): Promise<(TModel | undefined)[]> {
    const entities = await this.entityManager
      .getRepository(this.entityClass)
      .findByIds(ids.map((id) => id.value));
    const models = this.objectMapper.mapArray(entities, this.modelClass);
    return ids.map((id) => models.find((model) => model.id.equals(id)));
  }

  /**
   *
   */
  public async exists(id: TId): Promise<boolean> {
    const entity = await this.entityManager
      .getRepository(this.entityClass)
      .findOne(id.value);
    return Boolean(entity);
  }

  /**
   *
   */
  protected async doDelete(...models: TModel[]): Promise<void> {
    const ids = models.map((m) => m.id.value);
    await this.entityManager.getRepository(this.entityClass).delete(ids);
  }

  /**
   *
   */
  protected async doPersist(...models: TModel[]): Promise<void> {
    const entities = this.objectMapper.mapArray(models, this.entityClass);
    await this.entityManager.save(entities);
  }
}
