import { MockRepository, EntityNotFoundException } from 'common';
import { UserRepository } from 'user/repositories/user.repository';
import { User } from 'user/user';
import { MockUserEntity } from 'user/entities/mock-user.entity';

/**
 * Mock User Repository
 */
export class MockUserRepository extends MockRepository<User, MockUserEntity>
  implements UserRepository {
  /**
   *
   */
  public createEntity(user: User): MockUserEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new MockUserEntity(
      this,
      user.id,
      createdAt,
      updatedAt,
      user.email,
      user.firstName,
      user.lastName,
      user.lastLoginAt,
    );
  }

  /**
   *
   */
  public async findByName(fullName: string): Promise<MockUserEntity[]> {
    return Array.from(this.entities.values()).filter(entity =>
      `${entity.firstName} ${entity.lastName}`.includes(fullName),
    );
  }

  /**
   *
   */
  public async findByEmail(email: string): Promise<MockUserEntity> {
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
