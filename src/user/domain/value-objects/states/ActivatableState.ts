import { UserStateDecorator } from 'user/domain/value-objects/states/UserStateDecorator';
import { User } from 'user/domain/User';
import { UserActivatedEvent } from 'user/domain/events/UserActivatedEvent';
import { ActiveState } from 'user/domain/value-objects/states/ActiveState';

export class ActivatableState extends UserStateDecorator {
  // TODO better idea for sagas?
  public login(user: User): void {
    user.state = ActiveState.getInstance();
    user.raise(new UserActivatedEvent(user.id));
    user.login();
  }
}
