import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

/**
 * Repository
 */
export interface Repository<TModel extends Model> {
  /**
   *
   */
  findPage(afterId?: Id): Promise<TModel[]>;

  /**
   *
   */
  findById(id: Id): Promise<TModel>;

  /**
   *
   */
  findByIds(ids: Id[]): Promise<TModel[]>;

  /**
   *
   */
  exists(id: Id): Promise<boolean>;

  /**
   *
   */
  persist(...models: TModel[]): Promise<void>;

  /**
   *
   */
  delete(...models: TModel[]): Promise<void>;
}
