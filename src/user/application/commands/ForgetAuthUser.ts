import { User } from 'user/domain/User';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Type } from '@nestjs/common';

/**
 * Forget the authenticated user
 */
export class ForgetAuthUserCommand extends UserCommand {
  public constructor(authUser: User) {
    super(authUser);
  }
}

export class ForgetAuthUserCommandHandler extends AbstractUserCommandHandler<
  ForgetAuthUserCommand
> {
  protected async doHandle(command: ForgetAuthUserCommand): Promise<User> {
    command.authUser.forget();
    return command.authUser;
  }

  public getCommandType(): Type<ForgetAuthUserCommand> {
    return ForgetAuthUserCommand;
  }
}
