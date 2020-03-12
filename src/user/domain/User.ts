import { AggregateRoot } from 'common/domain/AggregateRoot';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { UserDeletedEvent } from 'user/domain/events/UserDeletedEvent';
import { UserCreatedEvent } from 'user/domain/events/UserCreatedEvent';
import { EmailChangedEvent } from 'user/domain/events/EmailChangedEvent';
import { Id } from 'common/domain/value-objects/Id';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { UserNameUpdatedEvent } from 'user/domain/events/UserNameUpdatedEvent';
import { Avatar } from 'user/domain/value-objects/Avatar';

export class User extends AggregateRoot {
  public email: Email;
  public name: Name;
  public avatar: Avatar | null;
  public lastLoginAt: LastLoginAt;

  public constructor(
    id: Id,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    email: Email,
    name: Name,
    avatar: Avatar | null,
    lastLoginAt: LastLoginAt,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.name = name;
    this.avatar = avatar;
    this.lastLoginAt = lastLoginAt;
  }

  /**
   *
   */
  public static create(email: Email, name: Name): User {
    const userId = Id.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const avatar = null;
    const lastLoginAt = LastLoginAt.now();
    const user = new User(
      userId,
      createdAt,
      updatedAt,
      email,
      name,
      avatar,
      lastLoginAt,
    );
    user.apply(new UserCreatedEvent(user));
    return user;
  }

  /**
   *
   */
  public static createEmpty(email: Email): User {
    const first = '';
    const last = '';
    const name = Name.from(first, last);
    return User.create(email, name);
  }

  /**
   *
   */
  public changeEmail(email: Email): void {
    this.email = email;
    this.apply(new EmailChangedEvent(this));
  }

  /**
   *
   */
  public updateName(name: Name): void {
    this.name = name;
    this.apply(new UserNameUpdatedEvent(this));
  }

  public delete(): void {
    this.apply(new UserDeletedEvent(this));
  }
}
