import { UserEntity } from 'user/entities/user.entity';
import { Repository } from 'common';
import { User } from 'user/user';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * User Repository
 */
export interface UserRepository extends Repository<User, UserEntity> {
  /**
   * Full text search on user's first name and last name.
   */
  findByName(fullName: string): Promise<UserEntity[]>;

  /**
   * Find user by email address.
   */
  findByEmail(email: string): Promise<UserEntity>;

  /**
   * Check if a user with the given email exists.
   */
  existsByEmail(email: string): Promise<boolean>;
}
