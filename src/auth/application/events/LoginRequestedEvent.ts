import { DomainEvent } from 'event/domain/DomainEvent';
import { User } from 'user/domain/User';

/**
 * Login Requested Event
 */
export class LoginRequestedEvent extends DomainEvent {
  public readonly user: User;
  public readonly magicSigninLink: string;

  constructor(user: User, magicLoginLink: string) {
    super();
    this.user = user;
    this.magicSigninLink = magicLoginLink;
  }
}
