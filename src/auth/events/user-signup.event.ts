import { Event } from 'event';
import { UserEntity } from 'user';

/**
 * User Signup Event
 */
export class UserSignupEvent extends Event {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
