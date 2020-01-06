/**
 * Repository
 */
export interface Repository<T, TEntity> {
  /**
   *
   */
  createEntity(object: T): TEntity;

  /**
   *
   */
  findPage(afterId?: string): Promise<TEntity[]>;

  /**
   *
   */
  findOne(id: string): Promise<TEntity>;

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
