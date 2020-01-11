import {
  Repository as InternalRepository,
  ObjectType,
  EntityManager,
} from 'typeorm';
import { EntityNotFoundException } from 'common/exceptions/entity-not-found.exception';
import { Repository } from 'common/repositories/repository.interface';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { Database } from 'database';
import { InvariantViolationException } from 'common/exceptions/invariant-violation.exception';
import ObjectID from 'bson-objectid';

/**
 * TypeOrm Repository
 */
export abstract class TypeOrmRepository<TEntity extends AbstractEntity>
  implements Repository<TEntity> {
  private readonly entityManager: EntityManager;
  private readonly entityClass: ObjectType<TEntity>;

  public constructor(database: Database, entityClass: ObjectType<TEntity>) {
    this.entityManager = database.getEntityManager();
    this.entityClass = entityClass;
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
  public async persist(...entities: TEntity[]): Promise<void> {
    await this.entityManager.save(entities);
  }

  /**
   *
   */
  public async findPage(afterId?: string): Promise<TEntity[]> {
    let builder = this.getInternalRepository()
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    if (afterId) {
      builder = builder.andWhere('id > :afterId', { afterId });
    }
    const entities = await builder.getMany();
    return entities;
  }

  /**
   *
   */
  public async findOne(id: string): Promise<TEntity> {
    const entity = await this.getInternalRepository().findOne(id);
    if (!entity) {
      throw new EntityNotFoundException();
    }
    return entity;
  }

  /**
   *
   */
  public async exists(id: string): Promise<boolean> {
    const entity = await this.entityManager
      .getRepository(this.entityClass)
      .findOne(id);
    return Boolean(entity);
  }

  /**
   *
   */
  public async refresh(...entities: TEntity[]): Promise<void> {
    const ids = entities.map(entity => entity.id);
    const newEntities = await this.getInternalRepository().findByIds(ids);
    if (entities.length !== newEntities.length) {
      // TODO log
      throw new InvariantViolationException();
    }
    for (let i = 0; i < entities.length; i++) {
      Object.assign(entities[i], newEntities[i]);
    }
  }

  /**
   *
   */
  public async delete(...entities: TEntity[]): Promise<void> {
    const ids = entities.map(entity => entity.id);
    await this.entityManager.getRepository(this.entityClass).delete(ids);
  }

  /**
   *
   */
  protected getInternalRepository(): InternalRepository<TEntity> {
    return this.entityManager.getRepository(this.entityClass);
  }
}
