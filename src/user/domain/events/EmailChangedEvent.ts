import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { User } from 'user/domain/User';

/**
 * Email Changed Event
 */
export class EmailChangedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
