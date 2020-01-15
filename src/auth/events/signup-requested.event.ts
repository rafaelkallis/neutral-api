import { AbstractEvent } from 'event';

/**
 * Signup Requested Event
 */
export class SignupRequestedEvent extends AbstractEvent {
  public readonly email: string;
  public readonly magicSignupLink: string;

  constructor(email: string, magicSignupLink: string) {
    super();
    this.email = email;
    this.magicSignupLink = magicSignupLink;
  }
}
