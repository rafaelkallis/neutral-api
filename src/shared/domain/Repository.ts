import { Id } from 'shared/domain/value-objects/Id';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { Subject, Subscription } from './Observer';

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
  private readonly persistedSubject: Subject<TModel>;

  public constructor() {
    this.persistedSubject = new Subject();
  }

  public subscribePersisted(
    persistedListener: PersistedListener<TId, TModel>,
  ): Subscription {
    return this.persistedSubject.subscribe({
      handle: (model) => persistedListener.handlePersisted(model),
    });
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
  public abstract delete(...models: TModel[]): Promise<void>;

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    await this.doPersist(...models);
    for (const model of models) {
      this.persistedSubject.handle(model);
    }
  }

  protected abstract doPersist(...models: TModel[]): Promise<void>;
}
