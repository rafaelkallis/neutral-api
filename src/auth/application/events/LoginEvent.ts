import { User } from 'user/domain/User';
import { DomainEvent } from 'shared/event/domain/DomainEvent';

/**
 * Login Event
 */
export class LoginEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
