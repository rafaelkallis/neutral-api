import { AbstractEvent } from 'event';
import { Email } from 'user/domain/value-objects/Email';

/**
 * Signup Requested Event
 */
export class SignupRequestedEvent extends AbstractEvent {
  public readonly email: Email;
  public readonly magicSignupLink: string;

  constructor(email: Email, magicSignupLink: string) {
    super();
    this.email = email;
    this.magicSignupLink = magicSignupLink;
  }
}
