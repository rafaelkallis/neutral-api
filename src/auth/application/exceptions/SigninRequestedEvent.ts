import { AbstractEvent } from 'event';
import { UserModel } from 'user';

/**
 * Signin Requested Event
 */
export class SigninRequestedEvent extends AbstractEvent {
  public readonly user: UserModel;
  public readonly magicSigninLink: string;

  constructor(user: UserModel, magicLoginLink: string) {
    super();
    this.user = user;
    this.magicSigninLink = magicLoginLink;
  }
}
