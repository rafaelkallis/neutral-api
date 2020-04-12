import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { Optional } from 'shared/domain/Optional';

/**
 * Repository
 */
export abstract class Repository<TId extends Id, TModel extends Model<TId>> {
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
  public abstract findByIds(ids: TId[]): Promise<Optional<TModel>[]>;

  /**
   *
   */
  public abstract exists(id: TId): Promise<boolean>;

  /**
   *
   */
  public abstract persist(...models: TModel[]): Promise<void>;

  /**
   *
   */
  public abstract delete(...models: TModel[]): Promise<void>;
}
