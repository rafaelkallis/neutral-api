import { ReadonlyUser } from 'user/domain/User';
import { Repository } from 'shared/domain/Repository';
import { Email } from 'user/domain/value-objects/Email';
import { UserId } from 'user/domain/value-objects/UserId';
import { Injectable } from '@nestjs/common';
import { UserRepositoryStrategy } from './UserRepositoryStrategy';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';

@Injectable()
export class UserRepository extends Repository<UserId, ReadonlyUser> {
  protected readonly strategy: UserRepositoryStrategy;

  public constructor(unitOfWork: UnitOfWork, strategy: UserRepositoryStrategy) {
    super(unitOfWork, strategy);
    this.strategy = strategy;
  }
  /**
   * Full text search on user's first name and last name.
   */
  public async findByName(fullName: string): Promise<ReadonlyUser[]> {
    const users = await this.strategy.findByName(fullName);
    this.loadedModels(users);
    return users;
  }

  /**
   * Find user by email address.
   */
  public async findByEmail(email: Email): Promise<ReadonlyUser | undefined> {
    const user = await this.strategy.findByEmail(email);
    if (user) {
      this.loadedModel(user);
    }
    return user;
  }

  /**
   * Check if a user with the given email exists.
   */
  public async existsByEmail(email: Email): Promise<boolean> {
    // TODO concurrency control ok like this?
    return this.strategy.existsByEmail(email);
  }
}
