import { User } from 'user/domain/User';
import {
  UserCommand,
  UserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

/**
 * Forget the authenticated user
 */
export class ForgetAuthUserCommand extends UserCommand {}

@Injectable()
@CommandHandler.register(ForgetAuthUserCommand)
export class ForgetAuthUserCommandHandler extends UserCommandHandler<
  ForgetAuthUserCommand
> {
  protected doHandle(command: ForgetAuthUserCommand): User {
    command.authUser.forget();
    return command.authUser;
  }
}
