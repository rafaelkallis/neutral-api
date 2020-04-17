import { User } from 'user/domain/User';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

/**
 * Login Event
 */
@DomainEventKey('auth.login')
export class LoginEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
