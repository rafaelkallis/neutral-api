import { AbstractEvent } from 'event';
import { UserModel } from 'user/domain/UserModel';

/**
 * Email Changed Event
 */
export class EmailChangedEvent extends AbstractEvent {
  public readonly user: UserModel;

  constructor(user: UserModel) {
    super();
    this.user = user;
  }
}
