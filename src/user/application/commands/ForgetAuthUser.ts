import { User } from 'user/domain/User';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Type } from '@nestjs/common';
import { SessionState } from 'shared/session/session-state';

/**
 * Forget the authenticated user
 */
export class ForgetAuthUserCommand extends UserCommand {
  public readonly session: SessionState;

  public constructor(authUser: User, session: SessionState) {
    super(authUser);
    this.session = session;
  }
}

export class ForgetAuthUserCommandHandler extends AbstractUserCommandHandler<
  ForgetAuthUserCommand
> {
  protected async doHandle(command: ForgetAuthUserCommand): Promise<User> {
    command.authUser.forget();
    command.session.clear();
    return command.authUser;
  }

  public getCommandType(): Type<ForgetAuthUserCommand> {
    return ForgetAuthUserCommand;
  }
}
