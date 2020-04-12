import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import {
  EventPublisher,
  InjectEventPublisher,
} from 'shared/event/publisher/EventPublisher';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { UserDto } from 'user/application/dto/UserDto';
import { SessionState } from 'shared/session';
import { AuthenticationResponseDto } from '../dto/AuthenticationResponseDto';
import { UserId } from 'user/domain/value-objects/UserId';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { TokenAlreadyUsedException } from 'shared/exceptions/token-already-used.exception';
import { LoginEvent } from '../events/LoginEvent';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';

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

@CommandHandler(SubmitLoginCommand)
export class SubmitLoginCommandHandler extends AbstractCommandHandler<
  AuthenticationResponseDto,
  SubmitLoginCommand
> {
  private readonly userRepository: UserRepository;
  private readonly tokenManager: TokenManager;
  private readonly objectMapper: ObjectMapper;
  private readonly eventPublisher: EventPublisher;

  public constructor(
    userRepository: UserRepository,
    tokenManager: TokenManager,
    objectMapper: ObjectMapper,
    @InjectEventPublisher() eventPublisher: EventPublisher,
  ) {
    super();
    this.userRepository = userRepository;
    this.tokenManager = tokenManager;
    this.objectMapper = objectMapper;
    this.eventPublisher = eventPublisher;
  }

  public async handle(
    command: SubmitLoginCommand,
  ): Promise<AuthenticationResponseDto> {
    const payload = this.tokenManager.validateLoginToken(command.loginToken);
    const userId = UserId.from(payload.sub);
    const lastLoginAt = LastLoginAt.from(payload.lastLoginAt);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!user.lastLoginAt.equals(lastLoginAt)) {
      throw new TokenAlreadyUsedException();
    }
    user.lastLoginAt = LastLoginAt.now(); // TODO: use user.login()
    await this.eventPublisher.publish(new LoginEvent(user));
    await this.userRepository.persist(user);
    const sessionToken = this.tokenManager.newSessionToken(user.id.value);
    command.session.set(sessionToken);
    const accessToken = this.tokenManager.newAccessToken(user.id.value);
    const refreshToken = this.tokenManager.newRefreshToken(user.id.value);
    const userDto = this.objectMapper.map(user, UserDto, { authUser: user });
    return new AuthenticationResponseDto(accessToken, refreshToken, userDto);
  }
}
