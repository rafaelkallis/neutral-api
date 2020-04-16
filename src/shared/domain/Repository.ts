import { Id } from 'shared/domain/value-objects/Id';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { Subject, Observable } from './Observer';

export interface PersistedListener<
  TId extends Id,
  TModel extends AggregateRoot<TId>
> {
  handlePersisted(model: TModel): Promise<void>;
}

/**
 * Repository
 */
export abstract class Repository<
  TId extends Id,
  TModel extends AggregateRoot<TId>
> {
  private readonly persistedModelsSubject: Subject<TModel>;
  private readonly deletedModelsSubject: Subject<TModel>;

  public constructor() {
    this.persistedModelsSubject = new Subject();
    this.deletedModelsSubject = new Subject();
  }

  /**
   * Observable over models that were persisted.
   */
  public get persistedModels(): Observable<TModel> {
    return this.persistedModelsSubject;
  }

  /**
   * Observable over models that were deleted.
   */
  public get deletedModels(): Observable<TModel> {
    return this.deletedModelsSubject;
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
  public abstract exists(id: TId): Promise<boolean>;

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    await this.doPersist(...models);
    for (const model of models) {
      await this.persistedModelsSubject.handle(model);
    }
  }

  /**
   *
   */
  public async delete(...models: TModel[]): Promise<void> {
    await this.doDelete(...models);
    for (const model of models) {
      await this.deletedModelsSubject.handle(model);
    }
  }

  protected abstract doPersist(...models: TModel[]): Promise<void>;

  /**
   *
   */
  protected abstract doDelete(...models: TModel[]): Promise<void>;
}
