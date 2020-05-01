import { UserStateDecorator } from 'user/domain/value-objects/states/UserStateDecorator';
import { User } from 'user/domain/User';
import { UserActivatedEvent } from 'user/domain/events/UserActivatedEvent';
import { ActiveState } from 'user/domain/value-objects/states/ActiveState';
import { Name } from 'user/domain/value-objects/Name';

export class ActivatableState extends UserStateDecorator {
  public activate(user: User, name: Name): void {
    user.name = name;
    user.state = ActiveState.getInstance();
    user.raise(new UserActivatedEvent(user.id));
  }
}
