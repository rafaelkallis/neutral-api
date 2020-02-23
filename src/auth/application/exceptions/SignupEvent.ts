import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * Signup Event
 */
export class SignupEvent extends AbstractEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
