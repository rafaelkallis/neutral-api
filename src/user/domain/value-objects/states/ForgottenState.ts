import {
  DefaultUserState,
  UserState,
} from 'user/domain/value-objects/states/UserState';

export class ForgottenState extends DefaultUserState {
  private static instance?: ForgottenState;

  public static getInstance(): UserState {
    if (!this.instance) {
      this.instance = new ForgottenState();
    }
    return this.instance;
  }
}
