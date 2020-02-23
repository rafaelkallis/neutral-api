import { AbstractEvent } from 'event';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';

/**
 * Email Change Requested Event
 */
export class EmailChangeRequestedEvent extends AbstractEvent {
  public readonly user: User;
  public readonly email: Email;
  public readonly magicEmailChangeLink: string;

  constructor(user: User, email: Email, magicEmailChangeLink: string) {
    super();
    this.user = user;
    this.email = email;
    this.magicEmailChangeLink = magicEmailChangeLink;
  }
}
