import { Event } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * User Updated Event
 */
export class UserUpdatedEvent extends Event {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
