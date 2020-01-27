import { Injectable, Inject } from '@nestjs/common';
import { TokenAlreadyUsedException } from 'common';
import { UserRepository, USER_REPOSITORY, UserEntity } from 'user';
import { RefreshDto } from 'auth/dto/refresh.dto';
import { RequestLoginDto } from 'auth/dto/request-login.dto';
import { RequestSignupDto } from 'auth/dto/request-signup.dto';
import { SubmitSignupDto } from 'auth/dto/submit-signup.dto';
import { EmailAlreadyUsedException } from 'auth/exceptions/email-already-used.exception';
import { ConfigService, InjectConfig } from 'config';
import { SessionState } from 'session/session-state';
import { TOKEN_SERVICE, TokenService } from 'token';
import { EventPublisher, InjectEventPublisher } from 'event';
import { SignupRequestedEvent } from 'auth/events/signup-requested.event';
import { SigninRequestedEvent } from 'auth/events/signin-requested.event';
import { SignupEvent } from 'auth/events/signup.event';
import { SigninEvent } from 'auth/events/signin.event';
import { UserDto } from 'user/dto/user.dto';

@Injectable()
export class AuthService {
  private readonly config: ConfigService;
  private readonly eventPublisher: EventPublisher;
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenService;

  public constructor(
    @InjectConfig() config: ConfigService,
    @InjectEventPublisher() eventPublisher: EventPublisher,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) tokenService: TokenService,
  ) {
    this.userRepository = userRepository;
    this.eventPublisher = eventPublisher;
    this.tokenService = tokenService;
    this.config = config;
  }

  /**
   * Passwordless login
   *
   * An email with a magic link is sent to the given email address
   */
  public async requestLogin(dto: RequestLoginDto): Promise<void> {
    const { email } = dto;
    const user = await this.userRepository.findByEmail(email);
    const loginToken = this.tokenService.newLoginToken(
      user.id,
      user.lastLoginAt,
    );
    const magicLoginLink = `${this.config.get(
      'FRONTEND_URL',
    )}/login/callback?token=${encodeURIComponent(loginToken)}`;
    await this.eventPublisher.publish(
      new SigninRequestedEvent(user, magicLoginLink),
    );
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
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    const payload = this.tokenService.validateLoginToken(loginToken);
    const user = await this.userRepository.findById(payload.sub);
    if (user.lastLoginAt !== payload.lastLoginAt) {
      throw new TokenAlreadyUsedException();
    }

    user.lastLoginAt = Date.now();
    await this.eventPublisher.publish(new SigninEvent(user));
    await this.userRepository.persist(user);

    const sessionToken = this.tokenService.newSessionToken(user.id);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    const userDto = UserDto.builder()
      .user(user)
      .authUser(user)
      .build();
    return { accessToken, refreshToken, user: userDto };
  }

  /**
   * Passwordless signup
   *
   * A magic link is sent to the given email address
   */
  public async requestSignup(dto: RequestSignupDto): Promise<void> {
    const { email } = dto;
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }
    const signupToken = this.tokenService.newSignupToken(email);
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
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    const payload = this.tokenService.validateSignupToken(signupToken);
    const userExists = await this.userRepository.existsByEmail(payload.sub);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }

    const userId = this.userRepository.createId();
    const user = UserEntity.fromUser({
      id: userId,
      email: payload.sub,
      firstName: dto.firstName,
      lastName: dto.lastName,
      lastLoginAt: Date.now(),
    });
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(new SignupEvent(user));

    const sessionToken = this.tokenService.newSessionToken(user.id);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    const userDto = UserDto.builder()
      .user(user)
      .authUser(user)
      .build();
    return { accessToken, refreshToken, user: userDto };
  }

  /**
   * Refresh the session
   *
   * A new access token is assigned to the session and sent back to the
   * response body.
   */
  public refresh(dto: RefreshDto): { accessToken: string } {
    const payload = this.tokenService.validateRefreshToken(dto.refreshToken);
    const accessToken = this.tokenService.newAccessToken(payload.sub);
    return { accessToken };
  }

  /**
   * Logout
   */
  public async logout(session: SessionState): Promise<void> {
    session.clear();
  }
}
