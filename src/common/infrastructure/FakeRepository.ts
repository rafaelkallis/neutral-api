import { Repository } from 'common/domain/Repository';
import { AbstractModel } from 'common/domain/AbstractModel';

/**
 * Fake Repository
 */
export abstract class FakeRepository<TModel extends AbstractModel>
  implements Repository<TModel> {
  protected readonly entities: Map<string, TModel>;

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
  public async findPage(afterId?: string): Promise<TModel[]> {
    return Array.from(this.entities.values()).filter(entity =>
      afterId ? afterId < entity.id : true,
    );
  }

  /**
   *
   */
  public async findById(id: string): Promise<TModel> {
    const entity = this.entities.get(id);
    if (!entity) {
      throw this.throwEntityNotFoundException();
    }
    return entity;
  }

  /**
   *
   */
  public async findByIds(ids: string[]): Promise<TModel[]> {
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
  public async persist(...entities: TModel[]): Promise<void> {
    for (const entity of entities) {
      entity.validate();
      this.entities.set(entity.id, entity);
    }
  }

  public async delete(...entities: TModel[]): Promise<void> {
    for (const entity of entities) {
      if (!this.entities.has(entity.id)) {
        this.throwEntityNotFoundException();
      }
      this.entities.delete(entity.id);
    }
  }

  /**
   *
   */
  protected abstract throwEntityNotFoundException(): never;
}
