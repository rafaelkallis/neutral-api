import { ObjectType, EntityManager } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { DatabaseClientService } from 'shared/database/DatabaseClientService';
import { Model } from 'shared/domain/Model';
import { TypeOrmEntityMapperService } from 'shared/infrastructure/TypeOrmEntityMapperService';
import { Id } from 'shared/domain/value-objects/Id';
import { Repository } from 'shared/domain/Repository';

/**
 * TypeOrm Repository
 */
export abstract class TypeOrmRepository<
  TModel extends Model,
  TEntity extends TypeOrmEntity
> implements Repository<TModel> {
  protected readonly entityManager: EntityManager;
  protected readonly entityMapper: TypeOrmEntityMapperService<TModel, TEntity>;

  public constructor(
    databaseClient: DatabaseClientService,
    entityMapper: TypeOrmEntityMapperService<TModel, TEntity>,
  ) {
    this.entityManager = databaseClient.getEntityManager();
    this.entityMapper = entityMapper;
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    for (const model of models) {
      model.validate();
    }
    const entities = models.map((m) => this.entityMapper.toEntity(m));
    await this.entityManager.save(entities);
  }

  /**
   *
   */
  public async findPage(afterId?: Id): Promise<TModel[]> {
    let builder = this.entityManager
      .getRepository(this.getEntityType())
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId: afterId.value });
    }
    const entities = await builder.getMany();
    const models = entities.map((e) => this.entityMapper.toModel(e));
    return models;
  }

  /**
   *
   */
  public async findById(id: Id): Promise<TModel> {
    const entity = await this.entityManager
      .getRepository(this.getEntityType())
      .findOne(id.value);
    if (!entity) {
      this.throwEntityNotFoundException();
    }
    const model = this.entityMapper.toModel(entity);
    return model;
  }

  /**
   *
   */
  public async findByIds(ids: Id[]): Promise<TModel[]> {
    const entities = await this.entityManager
      .getRepository(this.getEntityType())
      .findByIds(ids);
    if (ids.length !== entities.length) {
      this.throwEntityNotFoundException();
    }
    const models = entities.map((e) => this.entityMapper.toModel(e));
    return models;
  }

  /**
   *
   */
  public async exists(id: Id): Promise<boolean> {
    const entity = await this.entityManager
      .getRepository(this.getEntityType())
      .findOne(id.value);
    return Boolean(entity);
  }

  /**
   *
   */
  public async delete(...models: TModel[]): Promise<void> {
    const ids = models.map((m) => m.id.value);
    await this.entityManager.getRepository(this.getEntityType()).delete(ids);
  }

  /**
   * Throw entity-specific not-found exception
   */
  protected abstract throwEntityNotFoundException(): never;

  /**
   *
   */
  protected abstract getEntityType(): ObjectType<TEntity>;
}
