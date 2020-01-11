import { Event } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * Email Updated Event
 */
export class EmailUpdatedEvent extends Event {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
