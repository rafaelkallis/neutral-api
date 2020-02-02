import { AbstractEvent } from 'event';
import { UserModel } from 'user/domain/UserModel';

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
