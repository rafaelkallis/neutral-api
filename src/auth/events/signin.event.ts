import { AbstractEvent } from 'event';
import { UserEntity } from 'user';

/**
 * Signin Event
 */
export class SigninEvent extends AbstractEvent {
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    super();
    this.user = user;
  }
}
