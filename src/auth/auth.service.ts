import { Injectable } from '@nestjs/common';

import {
  ConfigService,
  EmailService,
  RandomService,
  SessionState,
  TokenAlreadyUsedException,
  TokenService,
  UserEntity,
  UserRepository,
} from '../common';

import { RefreshDto } from './dto/refresh.dto';
import { RequestLoginDto } from './dto/request-login.dto';
import { RequestSignupDto } from './dto/request-signup.dto';
import { SubmitSignupDto } from './dto/submit-signup.dto';
import { EmailAlreadyUsedException } from './exceptions/email-already-used.exception';

@Injectable()
export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenService;
  private readonly randomService: RandomService;
  private readonly emailService: EmailService;
  private readonly configService: ConfigService;

  public constructor(
    userRepository: UserRepository,
    tokenService: TokenService,
    randomService: RandomService,
    emailService: EmailService,
    configService: ConfigService,
  ) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.randomService = randomService;
    this.emailService = emailService;
    this.configService = configService;
  }

  /**
   * Passwordless login
   *
   * An email with a magic link is sent to the given email address
   */
  public async requestLogin(dto: RequestLoginDto): Promise<void> {
    const { email } = dto;
    const user = await this.userRepository.findOneOrFail({ email });
    const loginToken = this.tokenService.newLoginToken(
      user.id,
      user.lastLoginAt,
    );
    const magicLoginLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/login/callback?token=${encodeURIComponent(loginToken)}`;
    await this.emailService.sendLoginEmail(email, magicLoginLink);
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
    const user = await this.userRepository.findOneOrFail({ id: payload.sub });
    if (user.lastLoginAt !== payload.lastLoginAt) {
      throw new TokenAlreadyUsedException();
    }

    user.lastLoginAt = Date.now();
    await this.userRepository.save(user);

    const sessionToken = this.tokenService.newSessionToken(user.id);
    session.set(
      sessionToken,
      this.configService.get('SESSION_TOKEN_LIFETIME_MIN'),
    );
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
    const count = await this.userRepository.count({ email });
    if (count !== 0) {
      throw new EmailAlreadyUsedException();
    }
    const signupToken = this.tokenService.newSignupToken(email);
    const magicSignupLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/signup/callback?token=${encodeURIComponent(signupToken)}`;
    await this.emailService.sendSignupEmail(email, magicSignupLink);
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
    const count = await this.userRepository.count({ email: payload.sub });
    if (count > 0) {
      throw new EmailAlreadyUsedException();
    }

    const user = UserEntity.from({
      id: this.randomService.id(),
      email: payload.sub,
      firstName: dto.firstName,
      lastName: dto.lastName,
      lastLoginAt: Date.now(),
    });
    await this.userRepository.save(user);

    const sessionToken = this.tokenService.newSessionToken(user.id);
    session.set(
      sessionToken,
      this.configService.get('SESSION_TOKEN_LIFETIME_MIN'),
    );
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
}
