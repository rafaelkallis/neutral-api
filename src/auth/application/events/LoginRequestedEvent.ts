import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { ReadonlyUser } from 'user/domain/User';

/**
 * Login Requested Event
 */
export class LoginRequestedEvent extends DomainEvent {
  public readonly user: ReadonlyUser;
  public readonly loginLink: string;

  constructor(user: ReadonlyUser, loginLink: string) {
    super();
    this.user = user;
    this.loginLink = loginLink;
  }
}
