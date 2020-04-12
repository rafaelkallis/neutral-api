import { Id } from 'shared/domain/value-objects/Id';
import { Model } from 'shared/domain/Model';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { Repository } from 'shared/domain/Repository';
import { Type } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';

export class TypeOrmRepository<
  TId extends Id,
  TModel extends Model<TId>,
  TEntity extends TypeOrmEntity
> implements Repository<TId, TModel> {
  protected readonly modelType: Type<TModel>;
  protected readonly entityType: Type<TEntity>;
  protected readonly entityManager: EntityManager;
  protected readonly objectMapper: ObjectMapper;

  public constructor(
    modelType: Type<TModel>,
    entityType: Type<TEntity>,
    entityManager: EntityManager,
    modelMapper: ObjectMapper,
  ) {
    this.modelType = modelType;
    this.entityType = entityType;
    this.entityManager = entityManager;
    this.objectMapper = modelMapper;
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    const entities = this.objectMapper.mapArray(models, this.entityType);
    await this.entityManager.save(entities);
  }

  /**
   *
   */
  public async findPage(afterId?: TId): Promise<TModel[]> {
    let builder = this.entityManager
      .getRepository(this.entityType)
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId: afterId.value });
    }
    const entities = await builder.getMany();
    const models = this.objectMapper.mapArray(entities, this.modelType);
    return models;
  }

  /**
   *
   */
  public async findById(id: TId): Promise<TModel | undefined> {
    const entity = await this.entityManager
      .getRepository(this.entityType)
      .findOne(id.value);
    if (entity === undefined) {
      return undefined;
    }
    return this.objectMapper.map(entity, this.modelType);
  }

  /**
   *
   */
  public async findByIds(ids: TId[]): Promise<(TModel | undefined)[]> {
    const entities = await this.entityManager
      .getRepository(this.entityType)
      .findByIds(ids);
    const models = this.objectMapper.mapArray(entities, this.modelType);
    return ids.map((id) => models.find((model) => model.id.equals(id)));
  }

  /**
   *
   */
  public async exists(id: TId): Promise<boolean> {
    const entity = await this.entityManager
      .getRepository(this.entityType)
      .findOne(id.value);
    return Boolean(entity);
  }

  /**
   *
   */
  public async delete(...models: TModel[]): Promise<void> {
    const ids = models.map((m) => m.id.value);
    await this.entityManager.getRepository(this.entityType).delete(ids);
  }
}
