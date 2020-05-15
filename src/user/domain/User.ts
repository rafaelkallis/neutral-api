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
import { InvitedState } from 'user/domain/value-objects/states/InvitedState';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';

export interface ReadonlyUser extends ReadonlyAggregateRoot<UserId> {
  readonly email: Email;
  readonly name: Name;
  readonly avatar: Avatar | null;
  readonly state: UserState;
  readonly lastLoginAt: LastLoginAt;

  invite(): void;
  activate(name: Name): void;
  login(): void;
  changeEmail(email: Email): void;
  updateName(name: Name): void;
  updateAvatar(newAvatar: Avatar): void;
  removeAvatar(): void;
  forget(): void;
}

export class User extends AggregateRoot<UserId> implements ReadonlyUser {
  public email: Email;
  public name: Name;
  public avatar: Avatar | null;
  public state: UserState;
  public lastLoginAt: LastLoginAt;

  public constructor(
    unitOfWork: UnitOfWork,
    id: UserId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    email: Email,
    name: Name,
    avatar: Avatar | null,
    state: UserState,
    lastLoginAt: LastLoginAt,
  ) {
    super(unitOfWork, id, createdAt, updatedAt);
    this.email = email;
    this.name = name;
    this.avatar = avatar;
    this.state = state;
    this.lastLoginAt = lastLoginAt;
  }

  /**
   *
   */
  public static createInvited(
    unitOfWork: UnitOfWork,
    email: Email,
  ): ReadonlyUser {
    const first = '';
    const last = '';
    const name = Name.from(first, last);
    const userId = UserId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const avatar = null;
    const state = InvitedState.getInstance();
    const lastLoginAt = LastLoginAt.never();
    const user = new User(
      unitOfWork,
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

  public invite(): void {
    this.state.invite(this);
  }

  public activate(name: Name): void {
    this.state.activate(this, name);
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
}
