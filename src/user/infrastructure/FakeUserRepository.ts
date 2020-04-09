import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { UserId } from 'user/domain/value-objects/UserId';
import { FakeRepository } from 'shared/infrastructure/FakeRepository';
import { Optional } from 'shared/domain/Optional';

/**
 * Fake User Repository
 */
export class FakeUserRepository implements UserRepository {
  private readonly fakeRepository: FakeRepository<UserId, User>;

  public constructor() {
    this.fakeRepository = new FakeRepository();
  }

  public async findPage(afterId?: UserId | undefined): Promise<User[]> {
    return this.fakeRepository.findPage(afterId);
  }

  public async findById(id: UserId): Promise<Optional<User>> {
    return this.fakeRepository.findById(id);
  }

  public async findByIds(ids: UserId[]): Promise<Optional<User>[]> {
    return this.fakeRepository.findByIds(ids);
  }

  public async exists(id: UserId): Promise<boolean> {
    return this.fakeRepository.exists(id);
  }

  public async persist(...models: User[]): Promise<void> {
    return this.fakeRepository.persist(...models);
  }

  public async delete(...models: User[]): Promise<void> {
    return this.fakeRepository.delete(...models);
  }

  public async findByName(fullName: string): Promise<User[]> {
    return this.fakeRepository
      .getModels()
      .filter((entity) => entity.name.toString().includes(fullName));
  }

  public async findByEmail(email: Email): Promise<Optional<User>> {
    const user = this.fakeRepository
      .getModels()
      .find((user) => user.email.equals(email));
    return Optional.of(user);
  }

  public async existsByEmail(email: Email): Promise<boolean> {
    const user = this.fakeRepository
      .getModels()
      .find((model) => model.email.equals(email));
    return Boolean(user);
  }
}
