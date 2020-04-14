import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * Email Changed Event
 */
@DomainEventKey('user.email_changed')
export class EmailChangedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
