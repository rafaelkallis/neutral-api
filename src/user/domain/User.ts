import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { UserForgottenEvent } from 'user/domain/events/UserForgottenEvent';
import { UserCreatedEvent } from 'user/domain/events/UserCreatedEvent';
import { EmailChangedEvent } from 'user/domain/events/EmailChangedEvent';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { UserNameUpdatedEvent } from 'user/domain/events/UserNameUpdatedEvent';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { UserAvatarUpdatedEvent } from 'user/domain/events/UserAvatarUpdatedEvent';
import { UserAvatarRemovedEvent } from 'user/domain/events/UserAvatarRemovedEvent';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserState } from 'user/domain/value-objects/UserState';

export class User extends AggregateRoot<UserId> {
  public email: Email;
  public name: Name;
  public avatar: Avatar | null;
  public state: UserState;
  public lastLoginAt: LastLoginAt;

  public constructor(
    id: UserId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    email: Email,
    name: Name,
    avatar: Avatar | null,
    state: UserState,
    lastLoginAt: LastLoginAt,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.name = name;
    this.avatar = avatar;
    this.state = state;
    this.lastLoginAt = lastLoginAt;
  }

  /**
   *
   */
  public static createActive(email: Email, name: Name): User {
    const userId = UserId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const avatar = null;
    const state = UserState.ACTIVE;
    const lastLoginAt = LastLoginAt.now();
    const user = new User(
      userId,
      createdAt,
      updatedAt,
      email,
      name,
      avatar,
      state,
      lastLoginAt,
    );
    user.apply(new UserCreatedEvent(user.id));
    return user;
  }

  /**
   *
   */
  public static createInvited(email: Email): User {
    const first = '';
    const last = '';
    const name = Name.from(first, last);
    const userId = UserId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const avatar = null;
    const state = UserState.INVITED;
    const lastLoginAt = LastLoginAt.never();
    const user = new User(
      userId,
      createdAt,
      updatedAt,
      email,
      name,
      avatar,
      state,
      lastLoginAt,
    );
    user.apply(new UserCreatedEvent(user.id));
    return user;
  }

  /**
   *
   */
  public changeEmail(email: Email): void {
    this.state.assertEquals(UserState.ACTIVE);
    this.email = email;
    this.apply(new EmailChangedEvent(this));
  }

  /**
   *
   */
  public updateName(name: Name): void {
    this.state.assertEquals(UserState.ACTIVE);
    this.name = name;
    this.apply(new UserNameUpdatedEvent(this));
  }

  /**
   *
   */
  public updateAvatar(newAvatar: Avatar): void {
    this.state.assertEquals(UserState.ACTIVE);
    const oldAvatar = this.avatar;
    if (oldAvatar?.equals(newAvatar)) {
      return;
    }
    this.avatar = newAvatar;
    this.apply(new UserAvatarUpdatedEvent(this, newAvatar, oldAvatar));
  }

  /**
   *
   */
  public removeAvatar(): void {
    this.state.assertEquals(UserState.ACTIVE);
    const oldAvatar = this.avatar;
    if (oldAvatar) {
      this.avatar = null;
      this.apply(new UserAvatarRemovedEvent(this, oldAvatar));
    }
  }

  public forget(): void {
    this.state.assertEquals(UserState.ACTIVE);
    this.email = Email.redacted();
    this.name = Name.redacted();
    if (this.avatar) {
      this.avatar = Avatar.redacted();
    }
    this.state = UserState.FORGOTTEN;
    this.apply(new UserForgottenEvent(this.id));
  }
}
