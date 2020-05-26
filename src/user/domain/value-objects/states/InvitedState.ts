import {
  DefaultUserState,
  UserState,
} from 'user/domain/value-objects/states/UserState';
import { ActivatableState } from 'user/domain/value-objects/states/ActivatableState';

// TODO rename to PendingUserState
export class InvitedState extends DefaultUserState {
  private static instance?: InvitedState;

  public static getInstance(): UserState {
    if (!this.instance) {
      this.instance = new ActivatableState(new InvitedState());
    }
    return this.instance;
  }
}
