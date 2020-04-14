import { Request } from 'shared/mediator/Request';
import { User } from 'user/domain/User';

export abstract class Command<T> extends Request<T> {}

export abstract class AuthenticatedCommand<T> extends Command<T> {
  public readonly authUser: User;

  public constructor(authUser: User) {
    super();
    this.authUser = authUser;
  }
}
