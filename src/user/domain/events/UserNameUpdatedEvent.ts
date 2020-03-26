import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { User } from 'user/domain/User';

/**
 * User Name Updated Event
 */
export class UserNameUpdatedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
