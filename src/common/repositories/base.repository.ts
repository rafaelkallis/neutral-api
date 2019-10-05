import { Repository, FindConditions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

type FindPageConditions<T> = FindConditions<T> & {
  after?: string;
};

/**
 * Base Repository
 */
export class BaseRepository<T extends BaseEntity> extends Repository<T> {
  public async findPage(conditions: FindPageConditions<T> = {}): Promise<T[]> {
    let builder = this.createQueryBuilder('entity')
      .orderBy('entity.id', 'DESC')
      .take(10);
    if (conditions.after) {
      builder = builder.andWhere('entity.id > :after', {
        after: conditions.after,
      });
      delete conditions.after;
    }
    for (const [k, v] of Object.entries(conditions)) {
      builder = builder.andWhere(`entity.${k} = :${k}`, { [k]: v });
    }
    return builder.getMany();
  }
}
