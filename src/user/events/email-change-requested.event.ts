import { AbstractEvent } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * Email Change Requested Event
 */
export class EmailChangeRequestedEvent extends AbstractEvent {
  public readonly user: UserEntity;
  public readonly email: string;
  public readonly magicEmailChangeLink: string;

  constructor(user: UserEntity, email: string, magicEmailChangeLink: string) {
    super();
    this.user = user;
    this.email = email;
    this.magicEmailChangeLink = magicEmailChangeLink;
  }
}
