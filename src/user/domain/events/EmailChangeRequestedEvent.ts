import { DomainEvent } from 'event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';

/**
 * Email Change Requested Event
 */
export class EmailChangeRequestedEvent extends DomainEvent {
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
