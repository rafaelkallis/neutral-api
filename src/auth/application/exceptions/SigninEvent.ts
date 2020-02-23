import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * Signin Event
 */
export class SigninEvent extends AbstractEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
