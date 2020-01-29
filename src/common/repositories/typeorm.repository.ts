import {
  Repository as InternalRepository,
  ObjectType,
  EntityManager,
} from 'typeorm';
import { EntityNotFoundException } from 'common/exceptions/entity-not-found.exception';
import { Repository } from 'common/repositories/repository.interface';
import { AbstractEntity } from 'common/entities/abstract.entity';
import { DatabaseClientService } from 'database';
import { InvariantViolationException } from 'common/exceptions/invariant-violation.exception';
import ObjectID from 'bson-objectid';

/**
 * TypeOrm Repository
 */
export abstract class TypeOrmRepository<TEntity extends AbstractEntity>
  implements Repository<TEntity> {
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
  public async persist(...entities: TEntity[]): Promise<void> {
    await this.entityManager.save(entities);
  }

  /**
   *
   */
  public async findPage(afterId?: string): Promise<TEntity[]> {
    let builder = this.internalRepository
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
  public async findById(id: string): Promise<TEntity> {
    const entity = await this.internalRepository.findOne(id);
    if (!entity) {
      throw new EntityNotFoundException();
    }
    return entity;
  }

  /**
   *
   */
  public async findByIds(ids: string[]): Promise<TEntity[]> {
    const entities = await this.internalRepository.findByIds(ids);
    if (ids.length !== entities.length) {
      throw new EntityNotFoundException();
    }
    return entities;
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
  public async refresh(...entities: TEntity[]): Promise<void> {
    const ids = entities.map(entity => entity.id);
    const newEntities = await this.internalRepository.findByIds(ids);
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
    await this.internalRepository.delete(ids);
  }
}
