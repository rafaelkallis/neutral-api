import { Id } from 'shared/domain/value-objects/Id';
import { RepositoryStrategy } from 'shared/domain/Repository';
import { AggregateRoot } from 'shared/domain/AggregateRoot';

export class MemoryRepository<TId extends Id, TModel extends AggregateRoot<TId>>
  extends RepositoryStrategy<TId, TModel>
  implements Iterable<TModel> {
  private readonly models: Map<string, TModel>;

  public constructor() {
    super();
    this.models = new Map();
  }

  public [Symbol.iterator](): Iterator<TModel> {
    return this.models.values()[Symbol.iterator]();
  }

  /**
   *
   */
  public async findPage(afterId?: Id): Promise<TModel[]> {
    const results = Array.from(this.models.values()).filter((model) =>
      afterId ? afterId.lessThan(model.id) : true,
    );
    return Promise.resolve(results);
  }

  /**
   *
   */
  public async findById(id: Id): Promise<TModel | undefined> {
    return Promise.resolve(this.models.get(id.value));
  }

  /**
   *
   */
  public async findByIds(ids: Id[]): Promise<(TModel | undefined)[]> {
    return Promise.all(ids.map(async (id) => this.findById(id)));
  }

  /**
   *
   */
  public async exists(id: Id): Promise<boolean> {
    return Promise.resolve(this.models.has(id.value));
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    for (const model of models) {
      this.models.set(model.id.value, model);
    }
    return Promise.resolve();
  }
}
