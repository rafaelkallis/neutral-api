import { User } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Email } from 'user/domain/value-objects/Email';
import {
  UserCommand,
  UserCommandHandler,
} from 'user/application/commands/UserCommand';
import { UserId } from 'user/domain/value-objects/UserId';
import { UnauthorizedUserException } from 'shared/exceptions/unauthorized-user.exception';
import { TokenAlreadyUsedException } from 'shared/exceptions/token-already-used.exception';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserRepository } from 'user/domain/UserRepository';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';

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

@Injectable()
@CommandHandler.ofCommand(SubmitEmailChangeCommand)
export class SubmitEmailChangeCommandHandler extends UserCommandHandler<
  SubmitEmailChangeCommand
> {
  private readonly tokenManager: TokenManager;

  public constructor(
    objectMapper: ObjectMapper,
    userRepository: UserRepository,
    tokenManager: TokenManager,
  ) {
    super(objectMapper, userRepository);
    this.tokenManager = tokenManager;
  }

  protected doHandle(command: SubmitEmailChangeCommand): User {
    const payload = this.tokenManager.validateEmailChangeToken(command.token);
    const userIdFromPayload = UserId.from(payload.sub);
    if (!userIdFromPayload.equals(command.authUser.id)) {
      throw new UnauthorizedUserException();
    }
    const emailFromPayload = Email.of(payload.curEmail);
    if (!emailFromPayload.equals(command.authUser.email)) {
      throw new TokenAlreadyUsedException();
    }
    const newEmail = Email.of(payload.newEmail);
    command.authUser.changeEmail(newEmail);
    return command.authUser;
  }
}
