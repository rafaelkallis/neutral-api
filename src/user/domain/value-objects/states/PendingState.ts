import {
  DefaultUserState,
  UserState,
} from 'user/domain/value-objects/states/UserState';
import { ActivatableState } from 'user/domain/value-objects/states/ActivatableState';

export class PendingState extends DefaultUserState {
  private static instance?: PendingState;

  public static getInstance(): UserState {
    if (!this.instance) {
      this.instance = new ActivatableState(new PendingState());
    }
    return this.instance;
  }
}
