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

@Controller('users')
@ApiUseTags('Users')
export class UserController {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a list of users' })
  @ApiResponse({ status: 200, description: 'A list of users' })
  async getUsers() {
    return this.userRepository.find();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get the authenticated user' })
  @ApiResponse({ status: 200, description: 'The authenticated user' })
  async getAuthUser(@AuthUser() authUser: User): Promise<User> {
    return authUser;
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Patch the authenticated user' })
  @ApiResponse({ status: 200, description: 'User succesfully updated' })
  async patchAuthUser(
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

  @Post('me/email-change/:token')
  @ApiOperation({ title: 'Submit email change token' })
  @ApiImplicitParam({ name: 'token' })
  @ApiResponse({ status: 200, description: 'The updated user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async submitEmailChange(@Param('token') token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findOneOrFail({ id: payload.sub });
    if (user.email !== payload.curEmail) {
      throw new TokenAlreadyUsedException();
    }
    user.email = payload.newEmail;
    await this.userRepository.save(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a user' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'The requested user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ id });
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Delete the authenticated user' })
  @ApiResponse({
    status: 204,
    description: 'Authenticated user deleted succesfully',
  })
  async deleteAuthUser(@AuthUser() authUser: User): Promise<void> {
    await this.userRepository.remove(authUser);
  }
}
