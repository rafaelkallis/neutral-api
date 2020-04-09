import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { Repository } from 'shared/domain/Repository';
import { Optional } from 'shared/domain/Optional';

export class FakeRepository<TId extends Id, TModel extends Model<TId>>
  implements Repository<TId, TModel> {
  private readonly models: Map<string, TModel>;

  public constructor() {
    this.models = new Map();
  }

  public getModels(): TModel[] {
    return Array.from(this.models.values());
  }

  /**
   *
   */
  public async findPage(afterId?: Id): Promise<TModel[]> {
    return Array.from(this.models.values()).filter((model) =>
      afterId ? afterId.lessThan(model.id) : true,
    );
  }

  /**
   *
   */
  public async findById(id: Id): Promise<Optional<TModel>> {
    const model = this.models.get(id.value);
    if (!model) {
      return Optional.empty();
    }
    return Optional.of(model);
  }

  /**
   *
   */
  public async findByIds(ids: Id[]): Promise<Optional<TModel>[]> {
    return Promise.all(ids.map(async (id) => this.findById(id)));
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
      this.models.set(model.id.value, model);
    }
  }

  public async delete(...entities: TModel[]): Promise<void> {
    for (const model of entities) {
      this.models.delete(model.id.value);
    }
  }
}
