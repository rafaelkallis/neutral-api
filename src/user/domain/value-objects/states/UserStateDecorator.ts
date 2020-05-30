import { User } from 'user/domain/User';
import { UserState } from 'user/domain/value-objects/states/UserState';
import { Name } from 'user/domain/value-objects/Name';
import { Email } from 'user/domain/value-objects/Email';
import { Avatar } from 'user/domain/value-objects/Avatar';

export abstract class UserStateDecorator extends UserState {
  protected readonly base: UserState;

  public constructor(base: UserState) {
    super();
    this.base = base;
  }

  public login(user: User): void {
    this.base.login(user);
  }

  public changeEmail(user: User, email: Email): void {
    this.base.changeEmail(user, email);
  }

  public updateName(user: User, name: Name): void {
    this.base.updateName(user, name);
  }

  public updateAvatar(user: User, newAvatar: Avatar): void {
    this.base.updateAvatar(user, newAvatar);
  }

  public removeAvatar(user: User): void {
    this.base.removeAvatar(user);
  }

  public forget(user: User): void {
    this.base.forget(user);
  }

  public isActive(): boolean {
    return this.base.isActive();
  }
}
