import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * User Deleted Event
 */
export class UserDeletedEvent extends AbstractEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
