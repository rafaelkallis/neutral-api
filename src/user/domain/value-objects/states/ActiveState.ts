import {
  DefaultUserState,
  UserState,
} from 'user/domain/value-objects/states/UserState';
import { User } from 'user/domain/User';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { LoginEvent } from 'user/domain/events/LoginEvent';
import { Email } from 'user/domain/value-objects/Email';
import { EmailChangedEvent } from 'user/domain/events/EmailChangedEvent';
import { Name } from 'user/domain/value-objects/Name';
import { UserNameUpdatedEvent } from 'user/domain/events/UserNameUpdatedEvent';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { UserAvatarUpdatedEvent } from 'user/domain/events/UserAvatarUpdatedEvent';
import { UserAvatarRemovedEvent } from 'user/domain/events/UserAvatarRemovedEvent';
import { UserForgottenEvent } from 'user/domain/events/UserForgottenEvent';
import { ForgottenState } from './ForgottenState';

export class ActiveState extends DefaultUserState {
  private static instance?: ActiveState;

  public static getInstance(): UserState {
    if (!this.instance) {
      this.instance = new ActiveState();
    }
    return this.instance;
  }

  public login(user: User): void {
    user.lastLoginAt = LastLoginAt.now();
    user.raise(new LoginEvent(user));
  }

  public changeEmail(user: User, email: Email): void {
    user.email = email;
    user.raise(new EmailChangedEvent(user));
  }

  public updateName(user: User, name: Name): void {
    user.name = name;
    user.raise(new UserNameUpdatedEvent(user));
  }

  public updateAvatar(user: User, newAvatar: Avatar): void {
    const oldAvatar = user.avatar;
    if (oldAvatar?.equals(newAvatar)) {
      return;
    }
    user.avatar = newAvatar;
    user.raise(new UserAvatarUpdatedEvent(user, newAvatar, oldAvatar));
  }

  public removeAvatar(user: User): void {
    const oldAvatar = user.avatar;
    if (oldAvatar) {
      user.avatar = null;
      user.raise(new UserAvatarRemovedEvent(user, oldAvatar));
    }
  }

  public forget(user: User): void {
    user.email = Email.REDACTED;
    user.name = Name.redacted();
    user.avatar = Avatar.redacted();
    user.state = ForgottenState.getInstance();
    user.raise(new UserForgottenEvent(user.id));
  }

  public isActive(): boolean {
    return true;
  }
}
