import { User } from 'user/domain/User';
import { Repository } from 'shared/domain/Repository';
import { Email } from 'user/domain/value-objects/Email';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * User Repository
 */
@Repository.register(User)
export abstract class UserRepository extends Repository<UserId, User> {
  /**
   * Full text search on user's first name and last name.
   */
  public abstract findByName(fullName: string): Promise<User[]>;

  /**
   * Find user by email address.
   */
  public abstract findByEmail(email: Email): Promise<User | undefined>;
}
