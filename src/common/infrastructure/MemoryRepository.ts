import { Repository } from 'common/domain/Repository';
import { Model } from 'common/domain/Model';
import { Id } from 'common/domain/value-objects/Id';

/**
 * Memory Repository
 */
export abstract class MemoryRepository<TModel extends Model>
  implements Repository<TModel> {
  protected readonly models: Map<string, TModel>;

  public constructor() {
    this.models = new Map();
  }

  /**
   *
   */
  public async findPage(afterId?: Id): Promise<TModel[]> {
    return Array.from(this.models.values()).filter(model =>
      afterId ? afterId.lessThan(model.id) : true,
    );
  }

  /**
   *
   */
  public async findById(id: Id): Promise<TModel> {
    const model = this.models.get(id.value);
    if (!model) {
      throw this.throwEntityNotFoundException();
    }
    return model;
  }

  /**
   *
   */
  public async findByIds(ids: Id[]): Promise<TModel[]> {
    return Promise.all(ids.map(async id => this.findById(id)));
  }

  /**
   *
   */
  public async exists(id: Id): Promise<boolean> {
    return this.models.has(id.value);
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    for (const model of models) {
      model.validate();
      this.models.set(model.id.value, model);
    }
  }

  public async delete(...entities: TModel[]): Promise<void> {
    for (const model of entities) {
      if (!this.models.has(model.id.value)) {
        this.throwEntityNotFoundException();
      }
      this.models.delete(model.id.value);
    }
  }

  /**
   *
   */
  protected abstract throwEntityNotFoundException(): never;
}
