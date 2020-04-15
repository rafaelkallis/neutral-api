import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * User Updated Event
 */
@DomainEventKey('user.updated')
export class UserUpdatedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
