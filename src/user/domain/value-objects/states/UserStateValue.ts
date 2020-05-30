import { Singleton } from 'shared/domain/Singleton';
import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';
import { UserState } from 'user/domain/value-objects/states/UserState';
import { PendingState } from 'user/domain/value-objects/states/PendingState';
import { ActiveState } from 'user/domain/value-objects/states/ActiveState';
import { ForgottenState } from 'user/domain/value-objects/states/ForgottenState';
import { InvalidUserStateException } from 'user/domain/exceptions/InvalidUserStateException';

export enum UserStateValue {
  PENDING = 'pending',
  ACTIVE = 'active',
  FORGOTTEN = 'forgotten',
}

// TODO need a better solution than this
const associations: [UserStateValue, Singleton<UserState>][] = [
  [UserStateValue.PENDING, PendingState],
  [UserStateValue.ACTIVE, ActiveState],
  [UserStateValue.FORGOTTEN, ForgottenState],
];

export function getUserState(targetValue: UserStateValue): UserState {
  for (const [value, stateSingleton] of associations) {
    if (value === targetValue) {
      return stateSingleton.getInstance();
    }
  }
  throw new InvalidProjectStateException();
}

export function getUserStateValue(targetState: UserState): UserStateValue {
  for (const [value, stateSingleton] of associations) {
    if (stateSingleton.getInstance().equals(targetState)) {
      return value;
    }
  }
  throw new InvalidUserStateException();
}
