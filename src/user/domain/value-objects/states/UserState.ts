import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { Name } from 'user/domain/value-objects/Name';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { OperationNotSupportedByCurrentUserStateException } from 'user/domain/exceptions/OperationNotSupportedByCurrentUserStateException';

export abstract class UserState extends ValueObject {
  protected constructor() {
    super();
  }

  public abstract login(user: User): void;
  public abstract changeEmail(user: User, email: Email): void;
  public abstract updateName(user: User, name: Name): void;
  public abstract updateAvatar(user: User, newAvatar: Avatar): void;
  public abstract removeAvatar(user: User): void;
  public abstract forget(user: User): void;
  public abstract isPending(): boolean;
  public abstract isActive(): boolean;
}

export class DefaultUserState extends UserState {
  public login(_user: User): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public changeEmail(_user: User, _newEmail: Email): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public updateName(_user: User, _newName: Name): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public updateAvatar(_user: User, _newAvatar: Avatar): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public removeAvatar(_user: User): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public forget(_user: User): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public isPending(): boolean {
    return false;
  }

  public isActive(): boolean {
    return false;
  }
}
