import { AbstractEvent } from 'event';
import { UserModel } from 'user/domain/UserModel';
import { Email } from 'user/domain/value-objects/Email';

/**
 * Email Change Requested Event
 */
export class EmailChangeRequestedEvent extends AbstractEvent {
  public readonly user: UserModel;
  public readonly email: Email;
  public readonly magicEmailChangeLink: string;

  constructor(user: UserModel, email: Email, magicEmailChangeLink: string) {
    super();
    this.user = user;
    this.email = email;
    this.magicEmailChangeLink = magicEmailChangeLink;
  }
}
