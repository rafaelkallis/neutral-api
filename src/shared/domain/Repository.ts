import { Id } from 'shared/domain/value-objects/Id';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

/**
 * Repository
 */
export abstract class Repository<
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> {
  // TODO should absolutely not be in here, figure out how use observable
  private readonly domainEventBroker: DomainEventBroker;

  public constructor(domainEventBroker: DomainEventBroker) {
    this.domainEventBroker = domainEventBroker;
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
      await this.domainEventBroker.publish(...model.domainEvents);
    }
  }

  protected abstract doPersist(...models: TModel[]): Promise<void>;
}
