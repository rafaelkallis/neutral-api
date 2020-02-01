import { AbstractModel } from 'common/abstract.model';

/**
 * Repository
 */
export interface Repository<TModel extends AbstractModel> {
  /**
   *
   */
  createId(): string;

  /**
   *
   */
  findPage(afterId?: string): Promise<TModel[]>;

  /**
   *
   */
  findById(id: string): Promise<TModel>;

  /**
   *
   */
  findByIds(ids: string[]): Promise<TModel[]>;

  /**
   *
   */
  exists(id: string): Promise<boolean>;

  /**
   *
   */
  persist(...models: TModel[]): Promise<void>;

  /**
   *
   */
  delete(...models: TModel[]): Promise<void>;
}
