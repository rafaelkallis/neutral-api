import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  HttpStatus,
  UseGuards,
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

import { RefreshRequestDto } from 'auth/application/dto/RefreshRequestDto';
import { RequestLoginDto } from 'auth/application/dto/RequestLoginDto';
import { RequestSignupDto } from 'auth/application/dto/RequestSignupDto';
import { AuthenticationResponseDto } from 'auth/application/dto/AuthenticationResponseDto';
import { RefreshResponseDto } from 'auth/application/dto/RefreshResponseDto';
import { Mediator } from 'shared/mediator/Mediator';
import { RequestLoginCommand } from 'auth/application/commands/RequestLogin';
import { SubmitLoginCommand } from 'auth/application/commands/SubmitLogin';
import { RefreshCommand } from 'auth/application/commands/Refresh';
import { AuthGuard } from 'auth/application/guards/AuthGuard';

/**
 * Authentication Controller
 */
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private readonly mediator: Mediator;

  public constructor(mediator: Mediator) {
    this.mediator = mediator;
  }

  /**
   * Passwordless login
   *
   * An email with a magic link is sent to the given email address
   */
  @Post('login')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'requestLogin', summary: 'Request magic login' })
  @ApiNoContentResponse({ description: 'Magic login email sent' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async requestLogin(
    @Body(ValidationPipe) requestLoginDto: RequestLoginDto,
  ): Promise<void> {
    return this.mediator.send(new RequestLoginCommand(requestLoginDto.email));
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
  @ApiOperation({
    operationId: 'submitLogin',
    summary: 'Submit magic login token',
  })
  @ApiOkResponse({
    description: 'Magic login token accepted',
    type: AuthenticationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async submitLogin(
    @Param('token') loginToken: string,
  ): Promise<AuthenticationResponseDto> {
    return this.mediator.send(new SubmitLoginCommand(loginToken));
  }

  /**
   * Passwordless signup
   *
   * A magic link is sent to the given email address
   */
  @Post('signup')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'requestSignup',
    summary: 'Request magic signup',
    deprecated: true,
  })
  @ApiNoContentResponse({ description: 'Magic signup email sent' })
  @ApiBadRequestResponse({ description: 'Email already used' })
  public async requestSignup(
    @Body(ValidationPipe) requestSignupDto: RequestSignupDto,
  ): Promise<void> {
    return this.mediator.send(new RequestLoginCommand(requestSignupDto.email));
  }

  /**
   * Refresh the session
   *
   * A new access token is assigned to the session and sent back to the
   * response body.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'refresh', summary: 'Refresh tokens' })
  @ApiOkResponse({
    description: 'Refresh token accepted',
    type: RefreshResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid refresh token' })
  public async refresh(
    @Body(ValidationPipe) refreshRequestDto: RefreshRequestDto,
  ): Promise<RefreshResponseDto> {
    return this.mediator.send(
      new RefreshCommand(refreshRequestDto.refreshToken),
    );
  }

  /**
   * Logout the session
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'logout', summary: 'Logout', deprecated: true })
  @ApiNoContentResponse({ description: 'Logout successful' })
  public async logout(): Promise<void> {
    /* no-op */
  }
}
