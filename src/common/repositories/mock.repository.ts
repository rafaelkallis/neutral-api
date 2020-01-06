import { EntityNotFoundException } from 'common/exceptions/entity-not-found.exception';
import { Repository } from 'common/repositories/repository.interface';
import { MockEntity } from 'common/entities/mock.entity';

/**
 * Mock Repository
 */
export abstract class MockRepository<T, TEntity extends MockEntity<T>>
  implements Repository<T, TEntity> {
  protected readonly entities: Map<string, TEntity>;

  public constructor() {
    this.entities = new Map();
  }

  /**
   *
   */
  public abstract createEntity(object: T): TEntity;

  /**
   *
   */
  public async createAndPersistEntity(object: T): Promise<TEntity> {
    const entity = this.createEntity(object);
    await entity.persist();
    return entity;
  }

  /**
   *
   */
  public async findPage(afterId?: string): Promise<TEntity[]> {
    return Array.from(this.entities.values()).filter(entity =>
      afterId ? afterId < entity.id : true,
    );
  }

  /**
   *
   */
  public async findOne(id: string): Promise<TEntity> {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new EntityNotFoundException();
    }
    return entity;
  }

  /**
   *
   */
  public async exists(id: string): Promise<boolean> {
    return this.entities.has(id);
  }

  /**
   *
   */
  public async persist(...entities: TEntity[]): Promise<void> {
    for (const entity of entities) {
      this.entities.set(entity.id, entity);
    }
  }

  /**
   *
   */
  public async refresh(...entities: TEntity[]): Promise<void> {
    for (const entity of entities) {
      const newEntity = this.entities.get(entity.id);
      Object.assign(entity, newEntity);
    }
  }

  public async delete(...entities: TEntity[]): Promise<void> {
    for (const entity of entities) {
      this.entities.delete(entity.id);
    }
  }
}
