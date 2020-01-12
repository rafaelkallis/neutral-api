import { AbstractEvent } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * Email Change Requested Event
 */
export class EmailChangeRequestedEvent extends AbstractEvent {
  public readonly user: UserEntity;
  public readonly email: string;

  constructor(user: UserEntity, email: string) {
    super();
    this.user = user;
    this.email = email;
  }
}
