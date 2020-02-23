import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * User Created Event
 */
export class UserCreatedEvent extends AbstractEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
