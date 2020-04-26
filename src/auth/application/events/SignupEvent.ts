import { ReadonlyUser } from 'user/domain/User';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * Signup Event
 */
@DomainEventKey('auth.signup')
export class SignupEvent extends DomainEvent {
  public readonly user: ReadonlyUser;

  constructor(user: ReadonlyUser) {
    super();
    this.user = user;
  }
}
