import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * User Updated Event
 */
export class UserUpdatedEvent extends AbstractEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
