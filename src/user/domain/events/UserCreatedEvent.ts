import { AbstractEvent } from 'event';
import { UserModel } from 'user/domain/UserModel';

/**
 * User Created Event
 */
export class UserCreatedEvent extends AbstractEvent {
  public readonly user: UserModel;

  constructor(user: UserModel) {
    super();
    this.user = user;
  }
}
