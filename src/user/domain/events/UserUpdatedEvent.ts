import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { User } from 'user/domain/User';

/**
 * User Updated Event
 */
export class UserUpdatedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
