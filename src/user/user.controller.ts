import {
  Controller,
  Get,
  UseGuards,
  Body,
  ValidationPipe,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUseTags,
  ApiBearerAuth,
  ApiImplicitParam,
} from '@nestjs/swagger';
import {
  AuthGuard,
  AuthUser,
  User,
  UserRepository,
  UserNotFoundException,
  TokenService,
  EmailService,
  ConfigService,
  TokenAlreadyUsedException,
} from '../common';
import { PatchUserDto } from './dto/patch-user.dto';

@Controller('users')
@ApiUseTags('users')
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
  getAuthUser(@AuthUser() authUser: User) {
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
    await this.userRepository.save(authUser);
    return authUser;
  }

  @Post('me/email-change/:token')
  @ApiOperation({ title: 'Submit email change token' })
  @ApiImplicitParam({ name: 'token' })
  @ApiResponse({ status: 200, description: 'The updated user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async submitEmailChangeToken(
    @Param('token') token: string,
  ): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findOneOrFailWith(
      { id: payload.sub },
      new UserNotFoundException(),
    );
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
  async getUser(@Param('id') id: string) {
    return this.userRepository.findOneOrFailWith(
      { id },
      new UserNotFoundException(),
    );
  }
}
