import { FakeRepository } from 'common';
import { UserRepository } from 'user/repositories/user.repository';
import { UserModel } from 'user/user.model';
import { UserNotFoundException } from 'user/exceptions/user-not-found.exception';

/**
 * Fake User Repository
 */
export class FakeUserRepository extends FakeRepository<UserModel>
  implements UserRepository {
  /**
   *
   */
  public async findByName(fullName: string): Promise<UserModel[]> {
    return Array.from(this.entities.values()).filter(entity =>
      `${entity.firstName} ${entity.lastName}`.includes(fullName),
    );
  }

  /**
   *
   */
  public async findByEmail(email: string): Promise<UserModel> {
    const user = Array.from(this.entities.values()).find(
      entity => entity.email === email,
    );
    if (!user) {
      this.throwEntityNotFoundException();
    }
    return user;
  }

  /**
   *
   */
  public async existsByEmail(email: string): Promise<boolean> {
    const user = Array.from(this.entities.values()).find(
      entity => entity.email === email,
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
