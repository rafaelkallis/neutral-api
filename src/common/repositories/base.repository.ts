import { AbstractRepository, FindConditions } from 'typeorm';
import { BaseEntity } from 'common/entities/base.entity';
import { EntityNotFoundException } from 'common/exceptions/entity-not-found.exception';

type FindPageConditions<T> = FindConditions<T> & {
  after?: string;
};

/**
 * Base Repository
 */
export class BaseRepository<T extends BaseEntity> extends AbstractRepository<
  T
> {
  /**
   *
   */
  public async findPage(conditions: FindPageConditions<T> = {}): Promise<T[]> {
    let builder = this.repository
      .createQueryBuilder()
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

  public async findOne(conditions: FindConditions<T>): Promise<T> {
    const entity = await this.repository.findOne(conditions);
    if (!entity) {
      throw new EntityNotFoundException();
    }
    return entity;
  }

  public async exists(conditions: FindConditions<T>): Promise<boolean> {
    const count = await this.repository.count(conditions);
    return count > 0;
  }

  public async insert(entity: T | T[]): Promise<void> {
    await this.repository.insert(entity as any);
  }

  public async update(entity: T | T[]): Promise<void> {
    await this.repository.save(entity as any);
  }

  public async delete(entity: T | T[]): Promise<void> {
    if (Array.isArray(entity)) {
      await this.repository.delete(entity.map(e => e.id));
    } else {
      await this.repository.delete(entity.id);
    }
  }
}
