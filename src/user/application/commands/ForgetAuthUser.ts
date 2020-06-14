import { User } from 'user/domain/User';
import {
  UserCommand,
  UserCommandHandler,
} from 'user/application/commands/UserCommand';
import { SessionState } from 'shared/session/session-state';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

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

@Injectable()
@CommandHandler.register(ForgetAuthUserCommand)
export class ForgetAuthUserCommandHandler extends UserCommandHandler<
  ForgetAuthUserCommand
> {
  protected doHandle(command: ForgetAuthUserCommand): User {
    command.authUser.forget();
    command.session.clear();
    return command.authUser;
  }
}
