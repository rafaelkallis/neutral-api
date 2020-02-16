import { EntityManager } from 'typeorm';
import { Repository } from 'common/domain/Repository';
import { DatabaseClientService } from 'database';
import { Model } from 'common/domain/Model';
import { Id } from 'common/domain/value-objects/Id';

/**
 * TypeOrm Repository
 */
export abstract class TypeOrmRepository<TModel extends Model>
  implements Repository<TModel> {
  protected readonly entityManager: EntityManager;

  public constructor(databaseClient: DatabaseClientService) {
    this.entityManager = databaseClient.getEntityManager();
  }

  /**
   *
   */
  public abstract async persist(...models: TModel[]): Promise<void>;

  /**
   *
   */
  public abstract async findPage(afterId?: Id): Promise<TModel[]>;

  /**
   *
   */
  public abstract async findById(id: Id): Promise<TModel>;

  /**
   *
   */
  public abstract async findByIds(ids: Id[]): Promise<TModel[]>;

  /**
   *
   */
  public abstract async exists(id: Id): Promise<boolean>;

  /**
   *
   */
  public abstract async delete(...models: TModel[]): Promise<void>;
}
