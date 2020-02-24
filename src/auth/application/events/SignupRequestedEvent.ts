import { DomainEvent } from 'event/domain/DomainEvent';
import { Email } from 'user/domain/value-objects/Email';

/**
 * Signup Requested Event
 */
export class SignupRequestedEvent extends DomainEvent {
  public readonly email: Email;
  public readonly magicSignupLink: string;

  constructor(email: Email, magicSignupLink: string) {
    super();
    this.email = email;
    this.magicSignupLink = magicSignupLink;
  }
}
