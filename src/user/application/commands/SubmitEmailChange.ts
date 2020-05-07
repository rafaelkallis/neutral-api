import { Inject, Type } from '@nestjs/common';
import { User } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Email } from 'user/domain/value-objects/Email';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { UserId } from 'user/domain/value-objects/UserId';
import { UnauthorizedUserException } from 'shared/exceptions/unauthorized-user.exception';
import { TokenAlreadyUsedException } from 'shared/exceptions/token-already-used.exception';

/**
 * Submit the email change token to verify a new email address
 */
export class SubmitEmailChangeCommand extends UserCommand {
  public readonly token: string;

  public constructor(authUser: User, token: string) {
    super(authUser);
    this.token = token;
  }
}

export class SubmitEmailChangeCommandHandler extends AbstractUserCommandHandler<
  SubmitEmailChangeCommand
> {
  @Inject()
  private readonly tokenManager!: TokenManager;

  protected doHandle(command: SubmitEmailChangeCommand): User {
    const payload = this.tokenManager.validateEmailChangeToken(command.token);
    const userIdFromPayload = UserId.from(payload.sub);
    if (!userIdFromPayload.equals(command.authUser.id)) {
      throw new UnauthorizedUserException();
    }
    const emailFromPayload = Email.from(payload.curEmail);
    if (!emailFromPayload.equals(command.authUser.email)) {
      throw new TokenAlreadyUsedException();
    }
    const newEmail = Email.from(payload.newEmail);
    command.authUser.changeEmail(newEmail);
    return command.authUser;
  }

  public getCommandType(): Type<SubmitEmailChangeCommand> {
    return SubmitEmailChangeCommand;
  }
}
