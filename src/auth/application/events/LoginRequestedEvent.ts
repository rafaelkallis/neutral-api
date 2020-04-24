import { ReadonlyUser } from 'user/domain/User';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

/**
 * Login Requested Event
 */
export class LoginRequestedEvent extends DomainEvent {
  public readonly user: ReadonlyUser;
  public readonly magicSigninLink: string;

  constructor(user: ReadonlyUser, magicLoginLink: string) {
    super();
    this.user = user;
    this.magicSigninLink = magicLoginLink;
  }
}
