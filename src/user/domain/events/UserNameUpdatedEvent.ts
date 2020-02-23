import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * User Name Updated Event
 */
export class UserNameUpdatedEvent extends AbstractEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
