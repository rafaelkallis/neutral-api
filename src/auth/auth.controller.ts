import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Session,
} from '@nestjs/common';
import {
  ApiImplicitParam,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';

import {
  ConfigService,
  EmailService,
  ISession,
  RandomService,
  TokenAlreadyUsedException,
  TokenService,
  User,
  UserRepository,
  ValidationPipe,
} from '../common';

import { RefreshDto } from './dto/refresh.dto';
import { RequestLoginDto } from './dto/request-login.dto';
import { RequestSignupDto } from './dto/request-signup.dto';
import { SubmitSignupDto } from './dto/submit-signup.dto';
import { EmailAlreadyUsedException } from './exceptions/email-already-used.exception';

/**
 * Authentication Controller
 */
@Controller('auth')
@ApiUseTags('Auth')
export class AuthController {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private randomService: RandomService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Passwordless login
   *
   * An email with a magic link is sent to the given email address
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ title: 'Request magic login' })
  @ApiResponse({ status: 200, description: 'Magic login email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async requestLogin(@Body(ValidationPipe) dto: RequestLoginDto) {
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
  @Post('login/:token')
  @HttpCode(200)
  @ApiOperation({ title: 'Submit magic login token' })
  @ApiImplicitParam({ name: 'token' })
  @ApiResponse({ status: 200, description: 'Magic login token accepted' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async submitLogin(
    @Param('token') loginToken: string,
    @Session() session: ISession,
  ) {
    const payload = this.tokenService.validateLoginToken(loginToken);
    const user = await this.userRepository.findOneOrFail({ id: payload.sub });
    if (user.lastLoginAt !== payload.lastLoginAt) {
      throw new TokenAlreadyUsedException();
    }

    user.lastLoginAt = Date.now();
    await this.userRepository.save(user);

    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    session.set(
      accessToken,
      this.configService.get('ACCESS_TOKEN_LIFETIME_MIN'),
    );
    return { accessToken, refreshToken };
  }

  /**
   * Passwordless signup
   *
   * A magic link is sent to the given email address
   */
  @Post('signup')
  @HttpCode(200)
  @ApiOperation({ title: 'Request magic signup' })
  @ApiResponse({ status: 200, description: 'Magic signup email sent' })
  @ApiResponse({ status: 400, description: 'Email already used' })
  async requestSignup(@Body(ValidationPipe) dto: RequestSignupDto) {
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
  @Post('signup/:token')
  @ApiImplicitParam({ name: 'token' })
  @ApiOperation({ title: 'Submit magic signup token' })
  @ApiResponse({ status: 200, description: 'Magic signup token accepted' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async submitSignup(
    @Param('token') signupToken: string,
    @Body(ValidationPipe) dto: SubmitSignupDto,
    @Session() session: ISession,
  ) {
    const payload = this.tokenService.validateSignupToken(signupToken);
    const count = await this.userRepository.count({ email: payload.sub });
    if (count > 0) {
      throw new EmailAlreadyUsedException();
    }

    const user = new User();
    user.id = this.randomService.id();
    user.email = payload.sub;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.lastLoginAt = Date.now();
    await this.userRepository.save(user);

    const accessToken = this.tokenService.newAccessToken(user.id);
    session.set(
      accessToken,
      this.configService.get('ACCESS_TOKEN_LIFETIME_MIN'),
    );
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  /**
   * Refresh the session
   *
   * A new access token is assigned to the session and sent back to the
   * response body.
   */
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ title: 'Refresh tokens' })
  @ApiResponse({ status: 200, description: 'Refresh token accepted' })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  refresh(@Body(ValidationPipe) dto: RefreshDto, @Session() session: ISession) {
    const payload = this.tokenService.validateRefreshToken(dto.refreshToken);
    const accessToken = this.tokenService.newAccessToken(payload.sub);
    session.set(
      accessToken,
      this.configService.get('ACCESS_TOKEN_LIFETIME_MIN'),
    );
    return { accessToken };
  }
}
