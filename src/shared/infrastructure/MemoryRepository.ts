import { Id } from 'shared/domain/value-objects/Id';
import { Repository } from 'shared/domain/Repository';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { InternalServerErrorException } from '@nestjs/common';
import { Observable } from 'shared/domain/Observer';

export class MemoryRepository<
  TId extends Id,
  TModel extends AggregateRoot<TId>
> extends Repository<TId, TModel> {
  private readonly models: Map<string, TModel>;

  private constructor() {
    super();
    this.models = new Map();
  }

  public static create<
    TId extends Id,
    TModel extends AggregateRoot<TId>
  >(): MemoryRepository<TId, TModel> {
    return new MemoryRepository();
  }

  public get persistedModels(): Observable<TModel> {
    throw new InternalServerErrorException();
  }

  public get deletedModels(): Observable<TModel> {
    throw new InternalServerErrorException();
  }

  public getModels(): TModel[] {
    return Array.from(this.models.values());
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
  protected async doPersist(...models: TModel[]): Promise<void> {
    for (const model of models) {
      this.models.set(model.id.value, model);
    }
    return Promise.resolve();
  }
}
