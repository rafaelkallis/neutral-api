import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { User } from 'user/domain/User';

/**
 * User Deleted Event
 */
export class UserDeletedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
