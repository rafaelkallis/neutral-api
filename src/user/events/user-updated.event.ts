import { AbstractEvent } from 'event';
import { UserModel } from 'user/user.model';

/**
 * User Updated Event
 */
export class UserUpdatedEvent extends AbstractEvent {
  public readonly user: UserModel;

  constructor(user: UserModel) {
    super();
    this.user = user;
  }
}
