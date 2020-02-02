import { AbstractEvent } from 'event';
import { UserModel } from 'user';

/**
 * Signup Event
 */
export class SignupEvent extends AbstractEvent {
  public readonly user: UserModel;

  constructor(user: UserModel) {
    super();
    this.user = user;
  }
}
