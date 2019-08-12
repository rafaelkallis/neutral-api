import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiImplicitParam,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';

import {
  AuthGuard,
  AuthUser,
  ConfigService,
  EmailService,
  TokenAlreadyUsedException,
  TokenService,
  User,
  UserRepository,
  ValidationPipe,
} from '../common';

import { PatchUserDto } from './dto/patch-user.dto';

/**
 * User Controller
 */
@Controller('users')
@ApiUseTags('Users')
export class UserController {
  private readonly userRepository: UserRepository;
  private readonly configService: ConfigService;
  private readonly tokenService: TokenService;
  private readonly emailService: EmailService;

  public constructor(
    userRepository: UserRepository,
    configService: ConfigService,
    tokenService: TokenService,
    emailService: EmailService,
  ) {
    this.userRepository = userRepository;
    this.configService = configService;
    this.tokenService = tokenService;
    this.emailService = emailService;
  }

  /**
   * Get users
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a list of users' })
  @ApiResponse({ status: 200, description: 'A list of users' })
  public async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Get the authenticated user
   */
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get the authenticated user' })
  @ApiResponse({ status: 200, description: 'The authenticated user' })
  public async getAuthUser(@AuthUser() authUser: User): Promise<User> {
    return authUser;
  }

  /**
   * Update the authenticated user
   *
   * If the email address is changed, a email change magic link is sent
   * to verify the new email address.
   */
  @Patch('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Patch the authenticated user' })
  @ApiResponse({ status: 200, description: 'User succesfully updated' })
  public async patchAuthUser(
    @AuthUser() authUser: User,
    @Body(ValidationPipe) dto: PatchUserDto,
  ): Promise<User> {
    const { email, ...otherChanges } = dto;
    if (email) {
      const token = this.tokenService.newEmailChangeToken(
        authUser.id,
        authUser.email,
        email,
      );
      const emailChangeMagicLink = `${this.configService.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.emailService.sendEmailChangeEmail(email, emailChangeMagicLink);
    }
    Object.assign(authUser, otherChanges);
    return this.userRepository.save(authUser);
  }

  /**
   * Submit the email change token to verify a new email address
   */
  @Post('me/email-change/:token')
  @ApiOperation({ title: 'Submit email change token' })
  @ApiImplicitParam({ name: 'token' })
  @ApiResponse({ status: 200, description: 'The updated user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async submitEmailChange(@Param('token') token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findOneOrFail({ id: payload.sub });
    if (user.email !== payload.curEmail) {
      throw new TokenAlreadyUsedException();
    }
    user.email = payload.newEmail;
    await this.userRepository.save(user);
  }

  /**
   * Get the user with the given id
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a user' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'The requested user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async getUser(@Param('id') id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ id });
  }

  /**
   * Delete the authenticated user
   */
  @Delete('me')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Delete the authenticated user' })
  @ApiResponse({
    status: 204,
    description: 'Authenticated user deleted succesfully',
  })
  public async deleteAuthUser(@AuthUser() authUser: User): Promise<void> {
    await this.userRepository.remove(authUser);
  }
}
