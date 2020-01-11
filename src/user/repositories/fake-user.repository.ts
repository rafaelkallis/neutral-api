import { FakeRepository, EntityNotFoundException } from 'common';
import { UserRepository } from 'user/repositories/user.repository';
import { User } from 'user/user';
import { UserEntity } from 'user/entities/user.entity';

/**
 * Fake User Repository
 */
export class FakeUserRepository extends FakeRepository<UserEntity>
  implements UserRepository {
  /**
   *
   */
  public async findByName(fullName: string): Promise<UserEntity[]> {
    return Array.from(this.entities.values()).filter(entity =>
      `${entity.firstName} ${entity.lastName}`.includes(fullName),
    );
  }

  /**
   *
   */
  public async findByEmail(email: string): Promise<UserEntity> {
    const user = Array.from(this.entities.values()).find(
      entity => entity.email === email,
    );
    if (!user) {
      throw new EntityNotFoundException();
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
}
