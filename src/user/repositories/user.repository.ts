import { Repository } from 'common';
import { UserModel } from 'user/user.model';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * User Repository
 */
export interface UserRepository extends Repository<UserModel> {
  /**
   * Full text search on user's first name and last name.
   */
  findByName(fullName: string): Promise<UserModel[]>;

  /**
   * Find user by email address.
   */
  findByEmail(email: string): Promise<UserModel>;

  /**
   * Check if a user with the given email exists.
   */
  existsByEmail(email: string): Promise<boolean>;
}
