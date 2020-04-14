import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { UserId } from 'user/domain/value-objects/UserId';
import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';

/**
 * Memory User Repository
 */
export class MemoryUserRepository extends UserRepository {
  private readonly memoryRepository: MemoryRepository<UserId, User>;

  public constructor() {
    super();
    this.memoryRepository = MemoryRepository.create();
  }

  public async findPage(afterId?: UserId | undefined): Promise<User[]> {
    return this.memoryRepository.findPage(afterId);
  }

  public async findById(id: UserId): Promise<User | undefined> {
    return this.memoryRepository.findById(id);
  }

  public async findByIds(ids: UserId[]): Promise<(User | undefined)[]> {
    return this.memoryRepository.findByIds(ids);
  }

  public async exists(id: UserId): Promise<boolean> {
    return this.memoryRepository.exists(id);
  }

  protected async doPersist(...models: User[]): Promise<void> {
    return this.memoryRepository.persist(...models);
  }

  public async delete(...models: User[]): Promise<void> {
    return this.memoryRepository.delete(...models);
  }

  public async findByName(fullName: string): Promise<User[]> {
    return this.memoryRepository
      .getModels()
      .filter((entity) => entity.name.toString().includes(fullName));
  }

  public async findByEmail(email: Email): Promise<User | undefined> {
    return this.memoryRepository
      .getModels()
      .find((user) => user.email.equals(email));
  }

  public async existsByEmail(email: Email): Promise<boolean> {
    const user = this.memoryRepository
      .getModels()
      .find((model) => model.email.equals(email));
    return Boolean(user);
  }
}
