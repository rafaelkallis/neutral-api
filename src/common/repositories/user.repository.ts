import { EntityRepository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';

import { BaseRepository } from './base.repository';

/**
 * User Repository
 */
@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
  /**
   * Full text search on user's first name and last name.
   */
  public async findByName(name: string): Promise<UserEntity[]> {
    return [];
  }
}
