import { MemoryRepository, EntityNotFoundException } from 'common';
import { UserRepository } from 'user/repositories/user.repository';
import { User } from 'user/user';
import { MemoryUserEntity } from 'user/entities/memory-user.entity';

/**
 * User Repository
 */
export class MemoryUserRepository
  extends MemoryRepository<User, MemoryUserEntity>
  implements UserRepository {
  /**
   *
   */
  public createEntity(user: User): MemoryUserEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new MemoryUserEntity(
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
  public async findByName(fullName: string): Promise<MemoryUserEntity[]> {
    return Array.from(this.entities.values()).filter(entity =>
      `${entity.firstName} ${entity.lastName}`.includes(fullName),
    );
  }

  /**
   *
   */
  public async findByEmail(email: string): Promise<MemoryUserEntity> {
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
