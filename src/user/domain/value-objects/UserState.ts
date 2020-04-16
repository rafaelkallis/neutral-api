import { EnumValueObject } from 'shared/domain/value-objects/EnumValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidUserStateException } from 'user/domain/exceptions/InvalidUserStateException';
import { UserStateAssertionFailureException } from 'user/domain/exceptions/UserStateAssertionFailureException';

export enum UserStateValue {
  INVITED = 'invited',
  ACTIVE = 'active',
  FORGOTTEN = 'forgotten',
}

/**
 *
 */
export class UserState extends EnumValueObject<UserStateValue> {
  public static readonly INVITED = new UserState(UserStateValue.INVITED);
  public static readonly ACTIVE = new UserState(UserStateValue.ACTIVE);
  public static readonly FORGOTTEN = new UserState(UserStateValue.FORGOTTEN);

  /**
   *
   */
  public static from(value: UserStateValue): UserState {
    switch (value) {
      case UserStateValue.INVITED: {
        return UserState.INVITED;
      }
      case UserStateValue.ACTIVE: {
        return UserState.ACTIVE;
      }
      case UserStateValue.FORGOTTEN: {
        return UserState.FORGOTTEN;
      }
      default: {
        throw new InvalidUserStateException();
      }
    }
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof UserState)) {
      return false;
    }
    return super.equals(other);
  }

  public assertEquals(expectedState: UserState): void {
    if (!this.equals(expectedState)) {
      throw UserStateAssertionFailureException.from(this, expectedState);
    }
  }

  protected getEnumType(): Record<string, string> {
    return UserStateValue;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidUserStateException();
  }
}
