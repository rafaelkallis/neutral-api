import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiProduces,
  ApiConsumes,
  ApiBody,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { GetUsersQueryDto } from 'user/application/dto/GetUsersQueryDto';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { UserDto } from 'user/application/dto/UserDto';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { User } from 'user/domain/User';
import { UpdateAuthUserAvatarDto } from 'user/application/dto/UpdateAuthUserAvatarDto';

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
  @ApiOkResponse({ description: 'A list of users', type: [UserDto] })
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
  @ApiOkResponse({ description: 'The authenticated user', type: UserDto })
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
  @ApiOkResponse({ description: 'The requested user', type: UserDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getUser(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<UserDto> {
    return this.userApplication.getUser(authUser, id);
  }

  /**
   * Get the avatar of the user with the given id
   */
  @Get(':id/avatar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a user's avatar" })
  @ApiOkResponse({ description: 'The requested user avatar' })
  @ApiProduces(...UserApplicationService.AVATAR_MIME_TYPES)
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'User has no avatar' })
  public async getUserAvatar(
    @AuthUser() authUser: User,
    @Param('id') userId: string,
    @Res() response: Response,
  ): Promise<void> {
    const { file, contentType } = await this.userApplication.getUserAvatar(
      authUser,
      userId,
    );
    response.set('Content-Type', contentType);
    response.sendFile(file);
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
  @ApiOkResponse({ description: 'User succesfully updated', type: UserDto })
  public async updateAuthUser(
    @AuthUser() authUser: User,
    @Body(ValidationPipe) dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userApplication.updateAuthUser(authUser, dto);
  }

  /**
   * Update the authenticated user's avatar
   */
  @Put('me/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the authenticated user's avatar" })
  @ApiBody({ type: UpdateAuthUserAvatarDto })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: 'User avatar succesfully updated',
    type: UserDto,
  })
  public async updateAuthUserAvatar(
    @AuthUser() authUser: User,
    @UploadedFile() avatarFile: Express.Multer.File,
  ): Promise<UserDto> {
    return this.userApplication.updateAuthUserAvatar(
      authUser,
      avatarFile.path,
      avatarFile.mimetype,
    );
  }

  /**
   * Remove the authenticated user's avatar
   */
  @Delete('me/avatar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove the authenticated user's avatar" })
  @ApiOkResponse({
    description: 'User avatar succesfully removed',
    type: UserDto,
  })
  public async removeAuthUserAvatar(
    @AuthUser() authUser: User,
  ): Promise<UserDto> {
    return this.userApplication.removeAuthUserAvatar(authUser);
  }

  /**
   * Submit the email change token to verify a new email address
   */
  @Post('me/email-change/:token')
  @ApiOperation({ summary: 'Submit email change token' })
  @ApiOkResponse({ description: 'The updated user', type: UserDto })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @ApiNoContentResponse({
    description: 'Authenticated user deleted succesfully',
  })
  public async deleteAuthUser(@AuthUser() authUser: User): Promise<void> {
    return this.userApplication.deleteAuthUser(authUser);
  }
}
