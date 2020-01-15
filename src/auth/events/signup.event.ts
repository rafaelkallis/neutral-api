import { AbstractEvent } from 'event';
import { UserEntity } from 'user';

/**
 * Signup Event
 */
export class SignupEvent extends AbstractEvent {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
