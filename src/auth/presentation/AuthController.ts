import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Session,
} from '@nestjs/common';
import { ApiParam, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { AuthService } from '../application/AuthApplicationService';

import { RefreshDto } from '../application/dto/RefreshDto';
import { RequestLoginDto } from '../application/dto/RequestLoginDto';
import { RequestSignupDto } from '../application/dto/RequestSignupDto';
import { SubmitSignupDto } from '../application/dto/SubmitSignupDto';
import { SessionState } from 'shared/session/session-state';

/**
 * Authentication Controller
 */
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private readonly authService: AuthService;

  public constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Passwordless login
   *
   * An email with a magic link is sent to the given email address
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request magic login' })
  @ApiResponse({ status: 200, description: 'Magic login email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async requestLogin(
    @Body(ValidationPipe) dto: RequestLoginDto,
  ): Promise<void> {
    return this.authService.requestLogin(dto);
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
  @ApiOperation({ summary: 'Submit magic login token' })
  @ApiParam({ name: 'token' })
  @ApiResponse({ status: 200, description: 'Magic login token accepted' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async submitLogin(
    @Param('token') loginToken: string,
    @Session() session: SessionState,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.submitLogin(loginToken, session);
  }

  /**
   * Passwordless signup
   *
   * A magic link is sent to the given email address
   */
  @Post('signup')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request magic signup' })
  @ApiResponse({ status: 200, description: 'Magic signup email sent' })
  @ApiResponse({ status: 400, description: 'Email already used' })
  public async requestSignup(
    @Body(ValidationPipe) dto: RequestSignupDto,
  ): Promise<void> {
    return this.authService.requestSignup(dto);
  }

  /**
   * Passwordless signup token submit
   *
   * The signup token sent to the email address earlier is submitted here
   * along with other information about the user
   */
  @Post('signup/:token')
  @ApiParam({ name: 'token' })
  @ApiOperation({ summary: 'Submit magic signup token' })
  @ApiResponse({ status: 200, description: 'Magic signup token accepted' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  public async submitSignup(
    @Param('token') signupToken: string,
    @Body(ValidationPipe) dto: SubmitSignupDto,
    @Session() session: SessionState,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.submitSignup(signupToken, dto, session);
  }

  /**
   * Refresh the session
   *
   * A new access token is assigned to the session and sent back to the
   * response body.
   */
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({ status: 200, description: 'Refresh token accepted' })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  public refresh(
    @Body(ValidationPipe) dto: RefreshDto,
  ): { accessToken: string } {
    return this.authService.refresh(dto);
  }

  /**
   * Logout the session
   */
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  public async logout(@Session() session: SessionState): Promise<void> {
    return this.authService.logout(session);
  }
}
