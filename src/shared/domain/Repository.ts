import { Id } from 'shared/domain/value-objects/Id';
import {
  ReadonlyAggregateRoot,
  AggregateRoot,
} from 'shared/domain/AggregateRoot';
import { Subject, Observable } from './Observer';
import { InversableMap } from './InversableMap';
import { Class } from './Class';

const repositoryRegistry: InversableMap<
  Class<Repository<Id, AggregateRoot<Id>>>,
  Class<AggregateRoot<Id>>
> = InversableMap.empty();

/**
 * Repository
 */
export abstract class Repository<
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> {
  public static register(
    aggregateRootClass: Class<AggregateRoot<Id>>,
  ): ClassDecorator {
    return (
      repositoryClass: Class<Repository<Id, AggregateRoot<Id>>>,
    ): void => {
      repositoryRegistry.set(repositoryClass, aggregateRootClass);
    };
  }
  public static registry = repositoryRegistry.asReadonly();

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
