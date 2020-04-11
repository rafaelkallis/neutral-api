import { Injectable } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { SubmitSignupDto } from 'auth/application/dto/SubmitSignupDto';
import { EmailAlreadyUsedException } from 'auth/application/exceptions/EmailAlreadyUsedException';
import { Config } from 'shared/config/application/Config';
import { SessionState } from 'shared/session/session-state';
import { TokenManager } from 'shared/token/application/TokenManager';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { SignupEvent } from 'auth/application/events/SignupEvent';
import { LoginEvent } from 'auth/application/events/LoginEvent';
import { UserDto } from 'user/application/dto/UserDto';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { User } from 'user/domain/User';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { TokenAlreadyUsedException } from 'shared/exceptions/token-already-used.exception';
import {
  EventPublisher,
  InjectEventPublisher,
} from 'shared/event/publisher/EventPublisher';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { AuthenticationResponseDto } from 'auth/application/dto/AuthenticationResponseDto';
import { RefreshResponseDto } from 'auth/application/dto/RefreshResponseDto';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { RequestSignupDto } from './dto/RequestSignupDto';

@Injectable()
export class AuthService {
  private readonly config: Config;
  private readonly eventPublisher: EventPublisher;
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenManager;
  private readonly modelMapper: ObjectMapper;

  public constructor(
    config: Config,
    @InjectEventPublisher() eventPublisher: EventPublisher,
    userRepository: UserRepository,
    tokenService: TokenManager,
    modelMapper: ObjectMapper,
  ) {
    this.config = config;
    this.eventPublisher = eventPublisher;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.modelMapper = modelMapper;
  }

  /**
   * Passwordless login token submit
   *
   * The token sent in the magic link is submitted here.
   * An access token is assigned to the session, and both the access
   * and refresh token are sent back in the response body.
   */
  public async submitLogin(
    loginToken: string,
    session: SessionState,
  ): Promise<AuthenticationResponseDto> {
    const payload = this.tokenService.validateLoginToken(loginToken);
    const userId = UserId.from(payload.sub);
    const optionalUser = await this.userRepository.findById(userId);
    const user = optionalUser.orElseThrow(UserNotFoundException);
    if (!user.lastLoginAt.equals(LastLoginAt.from(payload.lastLoginAt))) {
      throw new TokenAlreadyUsedException();
    }

    user.lastLoginAt = LastLoginAt.now();
    await this.eventPublisher.publish(new LoginEvent(user));
    await this.userRepository.persist(user);

    const sessionToken = this.tokenService.newSessionToken(user.id.value);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id.value);
    const refreshToken = this.tokenService.newRefreshToken(user.id.value);
    const userDto = this.modelMapper.map(user, UserDto, { authUser: user });
    return new AuthenticationResponseDto(accessToken, refreshToken, userDto);
  }

  /**
   * Passwordless signup
   *
   * A magic link is sent to the given email address
   */
  public async requestSignup(dto: RequestSignupDto): Promise<void> {
    const email = Email.from(dto.email);
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }
    const signupToken = this.tokenService.newSignupToken(email.value);
    const magicSignupLink = `${this.config.get(
      'FRONTEND_URL',
    )}/signup/callback?token=${encodeURIComponent(signupToken)}`;
    await this.eventPublisher.publish(
      new SignupRequestedEvent(email, magicSignupLink),
    );
  }

  /**
   * Passwordless signup token submit
   *
   * The signup token sent to the email address earlier is submitted here
   * along with other information about the user
   */
  public async submitSignup(
    signupToken: string,
    dto: SubmitSignupDto,
    session: SessionState,
  ): Promise<AuthenticationResponseDto> {
    const payload = this.tokenService.validateSignupToken(signupToken);
    const email = Email.from(payload.sub);
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }

    const name = Name.from(dto.firstName, dto.lastName);
    const user = User.create(email, name);
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(
      new SignupEvent(user),
      ...user.getDomainEvents(),
    );

    const sessionToken = this.tokenService.newSessionToken(user.id.value);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id.value);
    const refreshToken = this.tokenService.newRefreshToken(user.id.value);
    const userDto: UserDto = this.modelMapper.map(user, UserDto, {
      authUser: user,
    });
    return new AuthenticationResponseDto(accessToken, refreshToken, userDto);
  }

  /**
   * Refresh the session
   *
   * A new access token is assigned to the session and sent back to the
   * response body.
   */
  public refresh(dto: RefreshDto): RefreshResponseDto {
    const payload = this.tokenService.validateRefreshToken(dto.refreshToken);
    const accessToken = this.tokenService.newAccessToken(payload.sub);
    return new RefreshResponseDto(accessToken);
  }

  /**
   * Logout
   */
  public async logout(session: SessionState): Promise<void> {
    session.clear();
  }
}
