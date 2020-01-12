import { AbstractEvent } from 'event';
import { UserEntity } from 'user';

/**
 * User Signup Event
 */
export class UserSignupEvent extends AbstractEvent {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
