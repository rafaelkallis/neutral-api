import { DomainEvent } from 'event/domain/DomainEvent';
import { User } from 'user/domain/User';

/**
 * Signup Event
 */
export class SignupEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
