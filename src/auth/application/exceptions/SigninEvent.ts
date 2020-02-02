import { AbstractEvent } from 'event';
import { UserModel } from 'user';

/**
 * Signin Event
 */
export class SigninEvent extends AbstractEvent {
  public readonly user: UserModel;

  constructor(user: UserModel) {
    super();
    this.user = user;
  }
}
