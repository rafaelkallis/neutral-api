import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { TypeOrmEntity } from '../infrastructure/TypeOrmEntity';
import { AggregateRoot } from '../domain/AggregateRoot';
import { Id } from 'shared/domain/value-objects/Id';
import { Class } from 'shared/domain/Class';

@Injectable()
export class TypeOrmRepository<
  TEntity extends TypeOrmEntity,
  TId extends Id,
  TModel extends AggregateRoot<TId>
> {
  protected readonly entityManager: EntityManager;
  protected readonly objectMapper: ObjectMapper;

  public constructor(entityManager: EntityManager, modelMapper: ObjectMapper) {
    this.entityManager = entityManager;
    this.objectMapper = modelMapper;
  }

  public async findPage(
    entityClass: Class<TEntity>,
    modelClass: Class<TModel>,
    afterId?: TId,
  ): Promise<TModel[]> {
    let builder = this.entityManager
      .getRepository(entityClass)
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId: afterId.value });
    }
    const entities = await builder.getMany();
    return this.objectMapper.mapArray(entities, modelClass);
  }

  public async findById(
    entityClass: Class<TEntity>,
    modelClass: Class<TModel>,
    id: TId,
  ): Promise<TModel | undefined> {
    const entity = await this.entityManager
      .getRepository(entityClass)
      .findOne(id.value);
    if (entity === undefined) {
      return undefined;
    }
    return this.objectMapper.map(entity, modelClass);
  }

  /**
   *
   */
  public async findByIds(
    entityClass: Class<TEntity>,
    modelClass: Class<TModel>,
    ids: TId[],
  ): Promise<(TModel | undefined)[]> {
    const entities = await this.entityManager
      .getRepository(entityClass)
      .findByIds(ids.map((id) => id.value));
    const models = this.objectMapper.mapArray(entities, modelClass);
    return ids.map((id) => models.find((model) => model.id.equals(id)));
  }

  public async delete(
    entityClass: Class<TEntity>,
    ...models: TModel[]
  ): Promise<void> {
    const ids = models.map((m) => m.id.value);
    await this.entityManager.getRepository(entityClass).delete(ids);
  }

  public async persist(
    entityClass: Class<TEntity>,
    ...models: TModel[]
  ): Promise<void> {
    const entities = this.objectMapper.mapArray(models, entityClass);
    await this.entityManager.save(entities);
  }
}
