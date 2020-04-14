import { Id } from 'shared/domain/value-objects/Id';
import { Repository } from 'shared/domain/Repository';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { Observable } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';

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

  public get persisted$(): Observable<TModel> {
    throw new InternalServerErrorException();
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
  public async findById(id: Id): Promise<TModel | undefined> {
    return this.models.get(id.value);
  }

  /**
   *
   */
  public async findByIds(ids: Id[]): Promise<(TModel | undefined)[]> {
    return Promise.all(ids.map((id) => this.findById(id)));
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
  protected async doPersist(...models: TModel[]): Promise<void> {
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
