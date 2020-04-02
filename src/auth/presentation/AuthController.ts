import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Session,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { AuthService } from 'auth/application/AuthApplicationService';

import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { RequestLoginDto } from 'auth/application/dto/RequestLoginDto';
import { RequestSignupDto } from 'auth/application/dto/RequestSignupDto';
import { SubmitSignupDto } from 'auth/application/dto/SubmitSignupDto';
import { SessionState } from 'shared/session/session-state';
import { AuthenticationResponseDto } from 'auth/application/dto/AuthenticationResponseDto';
import { RefreshResponseDto } from 'auth/application/dto/RefreshResponseDto';

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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Request magic login' })
  @ApiNoContentResponse({ description: 'Magic login email sent' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit magic login token' })
  @ApiOkResponse({
    description: 'Magic login token accepted',
    type: AuthenticationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async submitLogin(
    @Param('token') loginToken: string,
    @Session() session: SessionState,
  ): Promise<AuthenticationResponseDto> {
    return this.authService.submitLogin(loginToken, session);
  }

  /**
   * Passwordless signup
   *
   * A magic link is sent to the given email address
   */
  @Post('signup')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Request magic signup' })
  @ApiNoContentResponse({ description: 'Magic signup email sent' })
  @ApiBadRequestResponse({ description: 'Email already used' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit magic signup token' })
  @ApiOkResponse({
    description: 'Magic signup token accepted',
    type: AuthenticationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  public async submitSignup(
    @Param('token') signupToken: string,
    @Body(ValidationPipe) dto: SubmitSignupDto,
    @Session() session: SessionState,
  ): Promise<AuthenticationResponseDto> {
    return this.authService.submitSignup(signupToken, dto, session);
  }

  /**
   * Refresh the session
   *
   * A new access token is assigned to the session and sent back to the
   * response body.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse({
    description: 'Refresh token accepted',
    type: RefreshResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid refresh token' })
  public refresh(@Body(ValidationPipe) dto: RefreshDto): RefreshResponseDto {
    return this.authService.refresh(dto);
  }

  /**
   * Logout the session
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout' })
  @ApiNoContentResponse({ description: 'Logout successful' })
  public async logout(@Session() session: SessionState): Promise<void> {
    return this.authService.logout(session);
  }
}
