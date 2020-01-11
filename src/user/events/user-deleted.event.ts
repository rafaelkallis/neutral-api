import { Event } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * User Deleted Event
 */
export class UserDeletedEvent extends Event {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
