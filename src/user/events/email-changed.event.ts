import { AbstractEvent } from 'event';
import { UserEntity } from 'user/entities/user.entity';

/**
 * Email Changed Event
 */
export class EmailChangedEvent extends AbstractEvent {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
