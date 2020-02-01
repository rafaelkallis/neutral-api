import { AbstractEvent } from 'event';
import { UserModel } from 'user/user.model';

/**
 * User Deleted Event
 */
export class UserDeletedEvent extends AbstractEvent {
  public readonly user: UserModel;

  constructor(user: UserModel) {
    super();
    this.user = user;
  }
}
