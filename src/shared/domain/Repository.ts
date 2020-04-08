import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

/**
 * Repository
 */
export interface Repository<TId extends Id, TModel extends Model<TId>> {
  /**
   *
   */
  findPage(afterId?: TId): Promise<TModel[]>;

  /**
   *
   */
  findById(id: TId): Promise<TModel>;

  /**
   *
   */
  findByIds(ids: TId[]): Promise<TModel[]>;

  /**
   *
   */
  exists(id: TId): Promise<boolean>;

  /**
   *
   */
  persist(...models: TModel[]): Promise<void>;

  /**
   *
   */
  delete(...models: TModel[]): Promise<void>;
}
