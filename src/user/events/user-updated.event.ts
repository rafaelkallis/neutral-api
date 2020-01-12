import { AbstractEvent } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * User Updated Event
 */
export class UserUpdatedEvent extends AbstractEvent {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
