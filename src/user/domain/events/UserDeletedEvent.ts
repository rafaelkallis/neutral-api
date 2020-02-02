import { AbstractEvent } from 'event';
import { UserModel } from 'user/domain/UserModel';

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
