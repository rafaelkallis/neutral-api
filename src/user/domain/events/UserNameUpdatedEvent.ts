import { AbstractEvent } from 'event';
import { UserModel } from 'user/domain/UserModel';

/**
 * User Name Updated Event
 */
export class UserNameUpdatedEvent extends AbstractEvent {
  public readonly user: UserModel;

  constructor(user: UserModel) {
    super();
    this.user = user;
  }
}
