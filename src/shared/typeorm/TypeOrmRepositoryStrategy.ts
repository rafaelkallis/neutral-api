import { Id } from 'shared/domain/value-objects/Id';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { RepositoryStrategy } from 'shared/domain/RepositoryStrategy';
import { Type, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { AggregateRoot } from 'shared/domain/AggregateRoot';

@Injectable()
export abstract class TypeOrmRepositoryStrategy<
  TId extends Id,
  TModel extends AggregateRoot<TId>,
  TEntity extends TypeOrmEntity
> extends RepositoryStrategy<TId, TModel> {
  protected readonly entityManager: EntityManager;
  protected readonly objectMapper: ObjectMapper;

  public constructor(entityManager: EntityManager, objectMapper: ObjectMapper) {
    super();
    this.entityManager = entityManager;
    this.objectMapper = objectMapper;
  }

  /**
   *
   */
  public async findPage(afterId?: TId): Promise<TModel[]> {
    let builder = this.entityManager
      .getRepository(this.getEntityType())
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId: afterId.value });
    }
    const entities = await builder.getMany();
    const models = this.objectMapper.mapArray(entities, this.getModelType());
    return models;
  }

  /**
   *
   */
  public async findById(id: TId): Promise<TModel | undefined> {
    const entity = await this.entityManager
      .getRepository(this.getEntityType())
      .findOne(id.value);
    if (entity === undefined) {
      return undefined;
    }
    const model = this.objectMapper.map(entity, this.getModelType());
    return model;
  }

  /**
   *
   */
  public async findByIds(ids: TId[]): Promise<(TModel | undefined)[]> {
    const entities = await this.entityManager
      .getRepository(this.getEntityType())
      .findByIds(ids.map((id) => id.value));
    const models = this.objectMapper.mapArray(entities, this.getModelType());
    return ids.map((id) => models.find((model) => model.id.equals(id)));
  }

  /**
   *
   */
  public async exists(id: TId): Promise<boolean> {
    const entity = await this.entityManager
      .getRepository(this.getEntityType())
      .findOne(id.value);
    return Boolean(entity);
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    const entities = this.objectMapper.mapArray(models, this.getEntityType());
    await this.entityManager.save(entities);
  }

  protected abstract getModelType(): Type<TModel>;
  protected abstract getEntityType(): Type<TEntity>;
}
