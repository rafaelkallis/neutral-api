import {
  DefaultUserState,
  UserState,
} from 'user/domain/value-objects/states/UserState';
import { ActivatableState } from 'user/domain/value-objects/states/ActivatableState';
import { InvitedState } from 'user/domain/value-objects/states/InvitedState';
import { User } from 'user/domain/User';
import { UserInvitedEvent } from 'user/domain/events/UserInvitedEvent';

export class InitialState extends DefaultUserState {
  private static instance?: InitialState;

  public static getInstance(): UserState {
    if (!this.instance) {
      this.instance = new ActivatableState(new InitialState());
    }
    return this.instance;
  }

  public invite(user: User): void {
    user.state = InvitedState.getInstance();
    user.raise(new UserInvitedEvent(user.id));
  }
}
