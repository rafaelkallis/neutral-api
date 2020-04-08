import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';
import { Email } from 'user/domain/value-objects/Email';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * User Memory Repository
 */
export class UserFakeRepository extends MemoryRepository<UserId, User>
  implements UserRepository {
  /**
   *
   */
  public async findByName(fullName: string): Promise<User[]> {
    return Array.from(this.models.values()).filter((entity) =>
      entity.name.toString().includes(fullName),
    );
  }

  /**
   *
   */
  public async findByEmail(email: Email): Promise<User> {
    const user = Array.from(this.models.values()).find((entity) =>
      entity.email.equals(email),
    );
    if (!user) {
      this.throwEntityNotFoundException();
    }
    return user;
  }

  /**
   *
   */
  public async existsByEmail(email: Email): Promise<boolean> {
    const user = Array.from(this.models.values()).find((entity) =>
      entity.email.equals(email),
    );
    return Boolean(user);
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new UserNotFoundException();
  }
}
