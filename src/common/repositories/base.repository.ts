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
    let builder = this.createQueryBuilder()
      .orderBy('id', 'DESC')
      .take(10);

    const { after } = conditions;
    if (after) {
      builder = builder.andWhere('id > :after', { after });
      delete conditions.after;
    }
    for (const [k, v] of Object.entries(conditions)) {
      builder = builder.andWhere(`entity.${k} = :${k}`, { [k]: v });
    }
    return builder.getMany();
  }
}
