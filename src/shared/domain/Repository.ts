import { Id } from 'shared/domain/value-objects/Id';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';
import { Subject, Observable } from './Observer';

/**
 * Repository
 */
export abstract class Repository<
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> {
  private readonly persistedModelsSubject: Subject<TModel>;

  public constructor() {
    this.persistedModelsSubject = new Subject();
  }

  /**
   * Observable over models that were persisted.
   */
  public get persistedModels(): Observable<TModel> {
    return this.persistedModelsSubject;
  }

  /**
   *
   */
  public abstract findPage(afterId?: TId): Promise<TModel[]>;

  /**
   *
   */
  public abstract findById(id: TId): Promise<TModel | undefined>;

  /**
   *
   */
  public abstract findByIds(ids: TId[]): Promise<(TModel | undefined)[]>;

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    await this.doPersist(...models);
    for (const model of models) {
      await this.persistedModelsSubject.handle(model);
    }
  }

  protected abstract doPersist(...models: TModel[]): Promise<void>;
}
