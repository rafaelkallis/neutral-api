import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';

/**
 * Signin Requested Event
 */
export class SigninRequestedEvent extends AbstractEvent {
  public readonly user: User;
  public readonly magicSigninLink: string;

  constructor(user: User, magicLoginLink: string) {
    super();
    this.user = user;
    this.magicSigninLink = magicLoginLink;
  }
}
