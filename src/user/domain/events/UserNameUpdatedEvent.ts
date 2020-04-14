import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * User Name Updated Event
 */
@DomainEventKey('user.name_updated')
export class UserNameUpdatedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
