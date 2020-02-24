import {
  Body,
  Query,
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
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { UserDto } from 'user/application/dto/UserDto';
import { GetUsersQueryDto } from 'user/application/dto/GetUsersQueryDto';
import { ValidationPipe } from 'common/application/pipes/ValidationPipe';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { User } from 'user/domain/User';

/**
 * User Controller
 */
@Controller('users')
@ApiTags('Users')
export class UserController {
  private readonly userApplication: UserApplicationService;

  public constructor(userApplication: UserApplicationService) {
    this.userApplication = userApplication;
  }

  /**
   * Get users
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of users' })
  @ApiResponse({ status: 200, description: 'A list of users' })
  public async getUsers(
    @AuthUser() authUser: User,
    @Query(ValidationPipe) query: GetUsersQueryDto,
  ): Promise<UserDto[]> {
    return this.userApplication.getUsers(authUser, query);
  }

  /**
   * Get the authenticated user
   */
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiResponse({ status: 200, description: 'The authenticated user' })
  public async getAuthUser(@AuthUser() authUser: User): Promise<UserDto> {
    return this.userApplication.getAuthUser(authUser);
  }

  /**
   * Get the user with the given id
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'The requested user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async getUser(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<UserDto> {
    return this.userApplication.getUser(authUser, id);
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
  @ApiOperation({ summary: 'Update the authenticated user' })
  @ApiResponse({ status: 200, description: 'User succesfully updated' })
  public async updateAuthUser(
    @AuthUser() authUser: User,
    @Body(ValidationPipe) dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userApplication.updateAuthUser(authUser, dto);
  }

  /**
   * Submit the email change token to verify a new email address
   */
  @Post('me/email-change/:token')
  @ApiOperation({ summary: 'Submit email change token' })
  @ApiParam({ name: 'token' })
  @ApiResponse({ status: 200, description: 'The updated user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async submitEmailChange(@Param('token') token: string): Promise<void> {
    return this.userApplication.submitEmailChange(token);
  }

  /**
   * Delete the authenticated user
   */
  @Delete('me')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete the authenticated user' })
  @ApiResponse({
    status: 204,
    description: 'Authenticated user deleted succesfully',
  })
  public async deleteAuthUser(@AuthUser() authUser: User): Promise<void> {
    return this.userApplication.deleteAuthUser(authUser);
  }
}
