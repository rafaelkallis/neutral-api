import { Id } from 'shared/domain/value-objects/Id';
import {
  AggregateRoot,
  ReadonlyAggregateRoot,
} from 'shared/domain/AggregateRoot';
import { Subject, Observable } from './Observer';

export interface PersistedListener<
  TId extends Id,
  TModel extends AggregateRoot<TId>
> {
  handlePersisted(model: TModel): Promise<void>;
}

export abstract class RepositoryStrategy<
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> {
  public abstract findPage(afterId?: TId): Promise<TModel[]>;
  public abstract findById(id: TId): Promise<TModel | undefined>;
  public abstract findByIds(ids: TId[]): Promise<(TModel | undefined)[]>;
  public abstract exists(id: TId): Promise<boolean>;
  public abstract persist(...models: TModel[]): Promise<void>;
}

/**
 * Repository
 */
export abstract class Repository<
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> extends RepositoryStrategy<TId, TModel> {
  private readonly strategy: RepositoryStrategy<TId, TModel>;
  private readonly persistedModelsSubject: Subject<TModel>;

  public constructor(strategy: RepositoryStrategy<TId, TModel>) {
    super();
    this.strategy = strategy;
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
  public async findPage(afterId?: TId): Promise<TModel[]> {
    return this.strategy.findPage(afterId);
  }

  /**
   *
   */
  public async findById(id: TId): Promise<TModel | undefined> {
    return this.strategy.findById(id);
  }

  /**
   *
   */
  public async findByIds(ids: TId[]): Promise<(TModel | undefined)[]> {
    return this.strategy.findByIds(ids);
  }

  /**
   *
   */
  public async exists(id: TId): Promise<boolean> {
    return this.strategy.exists(id);
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    await this.strategy.persist(...models);
    for (const model of models) {
      await this.persistedModelsSubject.handle(model);
    }
  }
}
