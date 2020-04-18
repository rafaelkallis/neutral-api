import { User } from 'user/domain/User';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { CommandHandler } from 'shared/command/CommandHandler';

/**
 * Forget the authenticated user
 */
export class ForgetAuthUserCommand extends UserCommand {
  public constructor(authUser: User) {
    super(authUser);
  }
}

@CommandHandler(ForgetAuthUserCommand)
export class ForgetAuthUserCommandHandler extends AbstractUserCommandHandler<
  ForgetAuthUserCommand
> {
  protected async doHandle(command: ForgetAuthUserCommand): Promise<User> {
    command.authUser.forget();
    return command.authUser;
  }
}
