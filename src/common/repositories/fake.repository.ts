import { EntityNotFoundException } from 'common/exceptions/entity-not-found.exception';
import { Repository } from 'common/repositories/repository.interface';
import { AbstractEntity } from 'common/entities/abstract.entity';

/**
 * Fake Repository
 */
export abstract class FakeRepository<TEntity extends AbstractEntity>
  implements Repository<TEntity> {
  protected readonly entities: Map<string, TEntity>;

  private idSequence: number;

  public constructor() {
    this.entities = new Map();
    this.idSequence = 0;
  }

  /**
   *
   */
  public createId(): string {
    return String(this.idSequence++);
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
  public async findById(id: string): Promise<TEntity> {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new EntityNotFoundException();
    }
    return entity;
  }

  /**
   *
   */
  public async findByIds(ids: string[]): Promise<TEntity[]> {
    return Promise.all(ids.map(async id => this.findById(id)));
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
