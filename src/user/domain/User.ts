import {
  AggregateRoot,
  ReadonlyAggregateRoot,
} from 'shared/domain/AggregateRoot';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { UserCreatedEvent } from 'user/domain/events/UserCreatedEvent';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserState } from 'user/domain/value-objects/states/UserState';
import { PendingState } from 'user/domain/value-objects/states/PendingState';
import { Class } from 'shared/domain/Class';

export interface ReadonlyUser extends ReadonlyAggregateRoot<UserId> {
  readonly email: Email;
  readonly name: Name;
  readonly avatar: Avatar | null;
  readonly state: UserState;
  readonly lastLoginAt: LastLoginAt;
  isPending(): boolean;
  isActive(): boolean;
}

export abstract class User extends AggregateRoot<UserId>
  implements ReadonlyUser {
  public abstract readonly email: Email;
  public abstract readonly name: Name;
  public abstract readonly avatar: Avatar | null;
  public abstract readonly state: UserState;
  public abstract readonly lastLoginAt: LastLoginAt;

  public constructor(id: UserId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    super(id, createdAt, updatedAt);
  }

  public static of(
    id: UserId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    email: Email,
    name: Name,
    avatar: Avatar | null,
    state: UserState,
    lastLoginAt: LastLoginAt,
  ): User {
    return new InternalUser(
      id,
      createdAt,
      updatedAt,
      email,
      name,
      avatar,
      state,
      lastLoginAt,
    );
  }

  public static createInvited(email: Email): User {
    const first = '';
    const last = '';
    const name = Name.from(first, last);
    const userId = UserId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const avatar = null;
    const state = PendingState.getInstance();
    const lastLoginAt = LastLoginAt.never();
    const user = User.of(
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

  public abstract login(): void;
  public abstract changeEmail(email: Email): void;
  public abstract updateName(name: Name): void;
  public abstract updateAvatar(newAvatar: Avatar): void;
  public abstract removeAvatar(): void;
  public abstract forget(): void;

  public isPending(): boolean {
    return this.state.isPending();
  }

  public isActive(): boolean {
    return this.state.isActive();
  }
}

export class InternalUser extends User {
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
  public login(): void {
    this.state.login(this);
  }

  /**
   *
   */
  public changeEmail(newEmail: Email): void {
    this.state.changeEmail(this, newEmail);
  }

  /**
   *
   */
  public updateName(newName: Name): void {
    this.state.updateName(this, newName);
  }

  /**
   *
   */
  public updateAvatar(newAvatar: Avatar): void {
    this.state.updateAvatar(this, newAvatar);
  }

  /**
   *
   */
  public removeAvatar(): void {
    this.state.removeAvatar(this);
  }

  public forget(): void {
    this.state.forget(this);
  }

  public getClass(): Class<User> {
    return User;
  }
}
