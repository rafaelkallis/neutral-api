import { Command } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { UserDto } from 'user/application/dto/UserDto';
import { SessionState } from 'shared/session';
import { AuthenticationResponseDto } from '../dto/AuthenticationResponseDto';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { TokenAlreadyUsedException } from 'shared/exceptions/token-already-used.exception';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { AssociatedRequest } from 'shared/mediator/RequestHandler';
import { UserFactory } from 'user/application/UserFactory';
import { Email } from 'user/domain/value-objects/Email';
import { Injectable } from '@nestjs/common';

/**
 * Passwordless login token submit
 *
 * The token sent in the magic link is submitted here.
 * An access token is assigned to the session, and both the access
 * and refresh token are sent back in the response body.
 */
export class SubmitLoginCommand extends Command<AuthenticationResponseDto> {
  public readonly loginToken: string;
  public readonly session: SessionState;

  public constructor(loginToken: string, session: SessionState) {
    super();
    this.loginToken = loginToken;
    this.session = session;
  }
}

@Injectable()
@AssociatedRequest.d(SubmitLoginCommand)
export class SubmitLoginCommandHandler extends CommandHandler<
  AuthenticationResponseDto,
  SubmitLoginCommand
> {
  private readonly userRepository: UserRepository;
  private readonly userFactory: UserFactory;
  private readonly tokenManager: TokenManager;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    userRepository: UserRepository,
    userFactory: UserFactory,
    tokenManager: TokenManager,
    objectMapper: ObjectMapper,
  ) {
    super();
    this.userRepository = userRepository;
    this.userFactory = userFactory;
    this.tokenManager = tokenManager;
    this.objectMapper = objectMapper;
  }

  public async handle(
    command: SubmitLoginCommand,
  ): Promise<AuthenticationResponseDto> {
    const payload = this.tokenManager.validateLoginToken(command.loginToken);
    const email = Email.of(payload.sub);
    const lastLoginAt = LastLoginAt.from(payload.lastLoginAt);
    let user = await this.userRepository.findByEmail(email);
    if (!lastLoginAt.equals(user ? user.lastLoginAt : LastLoginAt.never())) {
      throw new TokenAlreadyUsedException();
    }
    if (!user) {
      user = this.userFactory.create({ email });
    }
    user.login();
    await this.userRepository.persist(user);
    const sessionToken = this.tokenManager.newSessionToken(user.id.value);
    command.session.set(sessionToken);
    const accessToken = this.tokenManager.newAccessToken(user.id.value);
    const refreshToken = this.tokenManager.newRefreshToken(user.id.value);
    const userDto = this.objectMapper.map(user, UserDto);
    return new AuthenticationResponseDto(accessToken, refreshToken, userDto);
  }
}
