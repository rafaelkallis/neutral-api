import { AbstractEvent } from 'event';
import { UserModel } from 'user/domain/UserModel';

/**
 * Email Change Requested Event
 */
export class EmailChangeRequestedEvent extends AbstractEvent {
  public readonly user: UserModel;
  public readonly email: string;
  public readonly magicEmailChangeLink: string;

  constructor(user: UserModel, email: string, magicEmailChangeLink: string) {
    super();
    this.user = user;
    this.email = email;
    this.magicEmailChangeLink = magicEmailChangeLink;
  }
}
