import { Injectable, Inject } from '@nestjs/common';

import { RandomService, TokenAlreadyUsedException } from 'common';
import { UserRepository, USER_REPOSITORY } from 'user';

import { RefreshDto } from 'auth/dto/refresh.dto';
import { RequestLoginDto } from 'auth/dto/request-login.dto';
import { RequestSignupDto } from 'auth/dto/request-signup.dto';
import { SubmitSignupDto } from 'auth/dto/submit-signup.dto';
import { EmailAlreadyUsedException } from '../exceptions/email-already-used.exception';
import { Config, CONFIG } from 'config';
import { EmailSender, EMAIL_SENDER } from 'email';
import { SessionState } from 'session/session-state';
import { TOKEN_SERVICE, TokenService } from 'token';

@Injectable()
export class AuthService {
  private readonly config: Config;
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenService;
  private readonly randomService: RandomService;
  private readonly emailSender: EmailSender;

  public constructor(
    @Inject(CONFIG) config: Config,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) tokenService: TokenService,
    randomService: RandomService,
    @Inject(EMAIL_SENDER) emailSender: EmailSender,
  ) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.randomService = randomService;
    this.emailSender = emailSender;
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
    await this.emailSender.sendLoginEmail(email, magicLoginLink);
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
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.tokenService.validateLoginToken(loginToken);
    const user = await this.userRepository.findOne(payload.sub);
    if (user.lastLoginAt !== payload.lastLoginAt) {
      throw new TokenAlreadyUsedException();
    }

    user.lastLoginAt = Date.now();
    await user.persist();

    const sessionToken = this.tokenService.newSessionToken(user.id);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    return { accessToken, refreshToken };
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
    await this.emailSender.sendSignupEmail(email, magicSignupLink);
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
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.tokenService.validateSignupToken(signupToken);
    const userExists = await this.userRepository.existsByEmail(payload.sub);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }

    const user = this.userRepository.createEntity({
      id: this.randomService.id(),
      email: payload.sub,
      firstName: dto.firstName,
      lastName: dto.lastName,
      lastLoginAt: Date.now(),
    });
    await user.persist();

    const sessionToken = this.tokenService.newSessionToken(user.id);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    return { accessToken, refreshToken };
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
