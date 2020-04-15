import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * User Deleted Event
 */
@DomainEventKey('user.deleted')
export class UserDeletedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
