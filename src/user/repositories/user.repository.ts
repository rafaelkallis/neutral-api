import { EntityRepository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { BaseRepository } from '../../common';

/**
 * User Repository
 */
@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
  /**
   * Full text search on user's first name and last name.
   */
  public async findByName(fullName: string): Promise<UserEntity[]> {
    return this.createQueryBuilder('user')
      .where('full_name ILIKE :fullName', { fullName: `%${fullName}%` })
      .orderBy('id', 'DESC')
      .take(10)
      .getMany();
  }
}
