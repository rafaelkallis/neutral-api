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
import { LoginEvent } from 'user/domain/events/LoginEvent';

export class User extends AggregateRoot<UserId> {
  private _email: Email;
  public get email(): Email {
    return this._email;
  }

  private _name: Name;
  public get name(): Name {
    return this._name;
  }

  private _avatar: Avatar | null;
  public get avatar(): Avatar | null {
    return this._avatar;
  }

  private _state: UserState;
  public get state(): UserState {
    return this._state;
  }

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
    this._email = email;
    this._name = name;
    this._avatar = avatar;
    this._state = state;
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
    user.raise(new UserCreatedEvent(user.id));
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
    user.raise(new UserCreatedEvent(user.id));
    return user;
  }

  /**
   *
   */
  public login(): void {
    if (this.state.equals(UserState.INVITED)) {
      this._state = UserState.ACTIVE;
      // TODO apply event
    }
    this.state.assertEquals(UserState.ACTIVE);
    this.lastLoginAt = LastLoginAt.now();
    this.raise(new LoginEvent(this));
  }

  /**
   *
   */
  public changeEmail(email: Email): void {
    this.state.assertEquals(UserState.ACTIVE);
    this._email = email;
    this.raise(new EmailChangedEvent(this));
  }

  /**
   *
   */
  public updateName(name: Name): void {
    this.state.assertEquals(UserState.ACTIVE);
    this._name = name;
    this.raise(new UserNameUpdatedEvent(this));
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
    this._avatar = newAvatar;
    this.raise(new UserAvatarUpdatedEvent(this, newAvatar, oldAvatar));
  }

  /**
   *
   */
  public removeAvatar(): void {
    this.state.assertEquals(UserState.ACTIVE);
    const oldAvatar = this.avatar;
    if (oldAvatar) {
      this._avatar = null;
      this.raise(new UserAvatarRemovedEvent(this, oldAvatar));
    }
  }

  public forget(): void {
    this.state.assertEquals(UserState.ACTIVE);
    this._email = Email.redacted();
    this._name = Name.redacted();
    if (this.avatar) {
      this._avatar = Avatar.redacted();
    }
    this._state = UserState.FORGOTTEN;
    this.raise(new UserForgottenEvent(this.id));
  }
}
