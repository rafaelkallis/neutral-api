import { AbstractEvent } from 'event';
import { UserEntity } from 'user';

/**
 * Signin Requested Event
 */
export class SigninRequestedEvent extends AbstractEvent {
  public readonly user: UserEntity;
  public readonly magicSigninLink: string;

  constructor(user: UserEntity, magicLoginLink: string) {
    super();
    this.user = user;
    this.magicSigninLink = magicLoginLink;
  }
}
