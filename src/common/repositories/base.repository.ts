import { Repository, FindConditions } from 'typeorm';

export class BaseRepository<T> extends Repository<T> {

  async findOneOrFailWith(
    conditions: FindConditions<T>,
    error: Error,
  ): Promise<T> {
    const entity = await this.findOne(conditions);
    if (!entity) {
      throw error;
    }
    return entity;
  }
}
