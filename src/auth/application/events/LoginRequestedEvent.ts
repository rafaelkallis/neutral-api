import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Email } from 'user/domain/value-objects/Email';

/**
 * Login Requested Event
 */
export class LoginRequestedEvent extends DomainEvent {
  public readonly email: Email;
  public readonly loginLink: string;

  constructor(email: Email, loginLink: string) {
    super();
    this.email = email;
    this.loginLink = loginLink;
  }
}
