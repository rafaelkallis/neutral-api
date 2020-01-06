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
import { UserDto } from './dto/user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { ValidationPipe } from 'common';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, AuthUser } from 'auth';

/**
 * User Controller
 */
@Controller('users')
@ApiTags('Users')
export class UserController {
  private readonly userService: UserService;

  public constructor(userService: UserService) {
    this.userService = userService;
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
    @AuthUser() authUser: UserEntity,
    @Query(ValidationPipe) query: GetUsersQueryDto,
  ): Promise<UserDto[]> {
    return this.userService.getUsers(authUser, query);
  }

  /**
   * Get the authenticated user
   */
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiResponse({ status: 200, description: 'The authenticated user' })
  public async getAuthUser(@AuthUser() authUser: UserEntity): Promise<UserDto> {
    return this.userService.getAuthUser(authUser);
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
  public async updateUser(
    @AuthUser() authUser: UserEntity,
    @Body(ValidationPipe) dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.updateUser(authUser, dto);
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
    return this.userService.submitEmailChange(token);
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
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<UserDto> {
    return this.userService.getUser(authUser, id);
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
  public async deleteAuthUser(@AuthUser() authUser: UserEntity): Promise<void> {
    return this.userService.deleteAuthUser(authUser);
  }
}
