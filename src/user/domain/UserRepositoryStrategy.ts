import { ReadonlyUser } from 'user/domain/User';
import { RepositoryStrategy } from 'shared/domain/RepositoryStrategy';
import { Email } from 'user/domain/value-objects/Email';
import { UserId } from 'user/domain/value-objects/UserId';

export abstract class UserRepositoryStrategy extends RepositoryStrategy<
  UserId,
  ReadonlyUser
> {
  public abstract findByName(fullName: string): Promise<ReadonlyUser[]>;
  public abstract findByEmail(email: Email): Promise<ReadonlyUser | undefined>;
  public abstract existsByEmail(email: Email): Promise<boolean>;
}
