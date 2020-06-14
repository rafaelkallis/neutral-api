import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { Name } from 'user/domain/value-objects/Name';
import { InternalUser } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { OperationNotSupportedByCurrentUserStateException } from 'user/domain/exceptions/OperationNotSupportedByCurrentUserStateException';

export abstract class UserState extends ValueObject {
  protected constructor() {
    super();
  }

  public abstract login(user: InternalUser): void;
  public abstract changeEmail(user: InternalUser, email: Email): void;
  public abstract updateName(user: InternalUser, name: Name): void;
  public abstract updateAvatar(user: InternalUser, newAvatar: Avatar): void;
  public abstract removeAvatar(user: InternalUser): void;
  public abstract forget(user: InternalUser): void;
  public abstract isPending(): boolean;
  public abstract isActive(): boolean;
}

export class DefaultUserState extends UserState {
  public login(_user: InternalUser): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public changeEmail(_user: InternalUser, _newEmail: Email): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public updateName(_user: InternalUser, _newName: Name): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public updateAvatar(_user: InternalUser, _newAvatar: Avatar): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public removeAvatar(_user: InternalUser): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public forget(_user: InternalUser): void {
    throw new OperationNotSupportedByCurrentUserStateException();
  }

  public isPending(): boolean {
    return false;
  }

  public isActive(): boolean {
    return false;
  }
}
