import { UserRepository } from 'user/domain/UserRepository';
import { UserModel } from 'user/domain/UserModel';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { MemoryRepository } from 'common/infrastructure/MemoryRepository';
import { Email } from 'user/domain/value-objects/Email';

/**
 * User Memory Repository
 */
export class UserFakeRepository extends MemoryRepository<UserModel>
  implements UserRepository {
  /**
   *
   */
  public async findByName(fullName: string): Promise<UserModel[]> {
    return Array.from(this.models.values()).filter(entity =>
      entity.name.toString().includes(fullName),
    );
  }

  /**
   *
   */
  public async findByEmail(email: Email): Promise<UserModel> {
    const user = Array.from(this.models.values()).find(entity =>
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
    const user = Array.from(this.models.values()).find(entity =>
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
