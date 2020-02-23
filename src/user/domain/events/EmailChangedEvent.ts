import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * Email Changed Event
 */
export class EmailChangedEvent extends AbstractEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
