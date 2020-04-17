import { Inject } from '@nestjs/common';
import { User } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Email } from 'user/domain/value-objects/Email';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { CommandHandler } from 'shared/command/CommandHandler';
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

@CommandHandler(SubmitEmailChangeCommand)
export class SubmitEmailChangeCommandHandler extends AbstractUserCommandHandler<
  SubmitEmailChangeCommand
> {
  @Inject()
  private readonly tokenManager!: TokenManager;

  protected async doHandle(command: SubmitEmailChangeCommand): Promise<User> {
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
}
