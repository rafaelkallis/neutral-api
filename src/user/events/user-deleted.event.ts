import { AbstractEvent } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * User Deleted Event
 */
export class UserDeletedEvent extends AbstractEvent {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
