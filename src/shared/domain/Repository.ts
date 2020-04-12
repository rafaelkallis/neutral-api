import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

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
  public abstract findByIds(ids: TId[]): Promise<(TModel | undefined)[]>;

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
