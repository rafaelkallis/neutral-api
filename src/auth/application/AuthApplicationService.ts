import { Injectable, Inject } from '@nestjs/common';
import { TokenAlreadyUsedException } from 'common';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { RequestLoginDto } from 'auth/application/dto/RequestLoginDto';
import { RequestSignupDto } from 'auth/application/dto/RequestSignupDto';
import { SubmitSignupDto } from 'auth/application/dto/SubmitSignupDto';
import { EmailAlreadyUsedException } from 'auth/application/exceptions/EmailAlreadyUsedException';
import { ConfigService, InjectConfig } from 'config';
import { SessionState } from 'session/session-state';
import { TOKEN_SERVICE, TokenService } from 'token';
import { EventPublisherService, InjectEventPublisher } from 'event';
import { SignupRequestedEvent } from 'auth/application/exceptions/SignupRequestedEvent';
import { SigninRequestedEvent } from 'auth/application/exceptions/SigninRequestedEvent';
import { SignupEvent } from 'auth/application/exceptions/SignupEvent';
import { SigninEvent } from 'auth/application/exceptions/SigninEvent';
import { UserDto } from 'user/application/dto/UserDto';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { UserModel } from 'user';
import { Id } from 'common/domain/value-objects/Id';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';

@Injectable()
export class AuthService {
  private readonly config: ConfigService;
  private readonly eventPublisher: EventPublisherService;
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenService;

  public constructor(
    @InjectConfig() config: ConfigService,
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) tokenService: TokenService,
  ) {
    this.config = config;
    this.eventPublisher = eventPublisher;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * Passwordless login
   *
   * An email with a magic link is sent to the given email address
   */
  public async requestLogin(dto: RequestLoginDto): Promise<void> {
    const email = Email.from(dto.email);
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
    const userId = Id.from(payload.sub);
    const user = await this.userRepository.findById(userId);
    if (!user.lastLoginAt.equals(LastLoginAt.from(payload.lastLoginAt))) {
      throw new TokenAlreadyUsedException();
    }

    user.lastLoginAt = LastLoginAt.now();
    await this.eventPublisher.publish(new SigninEvent(user));
    await this.userRepository.persist(user);

    const sessionToken = this.tokenService.newSessionToken(user.id.value);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id.value);
    const refreshToken = this.tokenService.newRefreshToken(user.id.value);
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
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    const payload = this.tokenService.validateSignupToken(signupToken);
    const email = Email.from(payload.sub);
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }

    const name = Name.from(dto.firstName, dto.lastName);
    const user = UserModel.create(email, name);
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(
      new SignupEvent(user),
      ...user.getDomainEvents(),
    );

    const sessionToken = this.tokenService.newSessionToken(user.id.value);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id.value);
    const refreshToken = this.tokenService.newRefreshToken(user.id.value);
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
