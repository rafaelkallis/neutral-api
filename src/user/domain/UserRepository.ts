import { Inject } from '@nestjs/common';
import { User } from 'user/domain/User';
import { Repository } from 'shared/domain/Repository';
import { Email } from 'user/domain/value-objects/Email';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export function InjectUserRepository(): ParameterDecorator {
  return Inject(USER_REPOSITORY);
}

/**
 * User Repository
 */
export interface UserRepository extends Repository<User> {
  /**
   * Full text search on user's first name and last name.
   */
  findByName(fullName: string): Promise<User[]>;

  /**
   * Find user by email address.
   */
  findByEmail(email: Email): Promise<User>;

  /**
   * Check if a user with the given email exists.
   */
  existsByEmail(email: Email): Promise<boolean>;
}
