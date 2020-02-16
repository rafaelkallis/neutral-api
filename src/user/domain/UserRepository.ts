import { UserModel } from 'user/domain/UserModel';
import { Repository } from 'common/domain/Repository';
import { Email } from 'user/domain/value-objects/Email';

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
  findByEmail(email: Email): Promise<UserModel>;

  /**
   * Check if a user with the given email exists.
   */
  existsByEmail(email: Email): Promise<boolean>;
}
