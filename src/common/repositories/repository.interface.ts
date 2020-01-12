import { AbstractEntity } from 'common/entities/abstract.entity';

/**
 * Repository
 */
export interface Repository<TEntity extends AbstractEntity> {
  /**
   *
   */
  createId(): string;

  /**
   *
   */
  findPage(afterId?: string): Promise<TEntity[]>;

  /**
   *
   */
  findById(id: string): Promise<TEntity>;

  /**
   *
   */
  findByIds(ids: string[]): Promise<TEntity[]>;

  /**
   *
   */
  exists(id: string): Promise<boolean>;

  /**
   *
   */
  persist(...entities: TEntity[]): Promise<void>;

  /**
   *
   */
  refresh(...entities: TEntity[]): Promise<void>;

  /**
   *
   */
  delete(...entities: TEntity[]): Promise<void>;
}
