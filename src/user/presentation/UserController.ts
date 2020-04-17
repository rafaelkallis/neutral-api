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
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
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
import { Mediator } from 'shared/mediator/Mediator';
import { GetUsersQuery } from 'user/application/queries/GetUsersQuery';
import { GetUserQuery } from 'user/application/queries/GetUserQuery';
import { GetAuthUserQuery } from 'user/application/queries/GetAuthUserQuery';
import { UpdateAuthUserCommand } from 'user/application/commands/UpdateAuthUser';
import { ForgetAuthUserCommand } from 'user/application/commands/ForgetAuthUser';
import { SubmitEmailChangeCommand } from 'user/application/commands/SubmitEmailChange';
import { UpdateAuthUserAvatarCommand } from 'user/application/commands/UpdateAuthUserAvatar';
import { RemoveAuthUserAvatarCommand } from 'user/application/commands/RemoveAuthUserAvatar';

/**
 * User Controller
 */
@Controller('users')
@ApiTags('Users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserController {
  private readonly userApplication: UserApplicationService;
  private readonly mediator: Mediator;

  public constructor(
    userApplication: UserApplicationService,
    mediator: Mediator,
  ) {
    this.userApplication = userApplication;
    this.mediator = mediator;
  }

  /**
   * Get users
   */
  @Get()
  @ApiOperation({ operationId: 'getUsers', summary: 'Get a list of users' })
  @ApiOkResponse({ description: 'A list of users', type: [UserDto] })
  public async getUsers(
    @AuthUser() authUser: User,
    @Query(ValidationPipe) query: GetUsersQueryDto,
  ): Promise<UserDto[]> {
    return this.mediator.send(
      new GetUsersQuery(authUser, query.after, query.q),
    );
  }

  /**
   * Get the authenticated user
   */
  @Get('me')
  @ApiOperation({
    operationId: 'getAuthUser',
    summary: 'Get the authenticated user',
  })
  @ApiOkResponse({ description: 'The authenticated user', type: UserDto })
  public async getAuthUser(@AuthUser() authUser: User): Promise<UserDto> {
    return this.mediator.send(new GetAuthUserQuery(authUser));
  }

  /**
   * Get the user with the given id
   */
  @Get(':id')
  @ApiOperation({ operationId: 'getUser', summary: 'Get a user' })
  @ApiOkResponse({ description: 'The requested user', type: UserDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getUser(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<UserDto> {
    return this.mediator.send(new GetUserQuery(authUser, id));
  }

  /**
   * Get the avatar of the user with the given id
   */
  @Get(':id/avatar')
  @ApiOperation({
    operationId: 'getUserAvatar',
    summary: "Get a user's avatar",
  })
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
  @ApiOperation({
    operationId: 'updateAuthUser',
    summary: 'Update the authenticated user',
  })
  @ApiOkResponse({ description: 'User succesfully updated', type: UserDto })
  public async updateAuthUser(
    @AuthUser() authUser: User,
    @Body(ValidationPipe) dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.mediator.send(
      new UpdateAuthUserCommand(
        authUser,
        dto.email,
        dto.firstName,
        dto.lastName,
      ),
    );
  }

  /**
   * Update the authenticated user's avatar
   */
  @Put('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    operationId: 'updateAuthUserAvatar',
    summary: "Update the authenticated user's avatar",
  })
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
    return this.mediator.send(
      new UpdateAuthUserAvatarCommand(
        authUser,
        avatarFile.path,
        avatarFile.mimetype,
      ),
    );
  }

  /**
   * Remove the authenticated user's avatar
   */
  @Delete('me/avatar')
  @ApiOperation({
    operationId: 'removeAuthUserAvatar',
    summary: "Remove the authenticated user's avatar",
  })
  @ApiOkResponse({
    description: 'User avatar succesfully removed',
    type: UserDto,
  })
  public async removeAuthUserAvatar(
    @AuthUser() authUser: User,
  ): Promise<UserDto> {
    return this.mediator.send(new RemoveAuthUserAvatarCommand(authUser));
  }

  /**
   * Submit the email change token to verify a new email address
   */
  @Post('me/email-change/:token')
  @ApiOperation({
    operationId: 'submitEmailChange',
    summary: 'Submit email change token',
  })
  @ApiOkResponse({ description: 'The updated user', type: UserDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async submitEmailChange(
    @AuthUser() authUser: User,
    @Param('token') token: string,
  ): Promise<UserDto> {
    return this.mediator.send(new SubmitEmailChangeCommand(authUser, token));
  }

  /**
   * Delete the authenticated user
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteAuthUser',
    summary: 'Forget the authenticated user. Use "/:id/forget" instead',
    deprecated: true,
  })
  @ApiNoContentResponse({
    description: 'Authenticated user deleted succesfully',
  })
  public async deleteAuthUser(@AuthUser() authUser: User): Promise<void> {
    await this.mediator.send(new ForgetAuthUserCommand(authUser));
  }

  /**
   * Forget the authenticated user
   */
  @Post('me/forget')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'forgetAuthUser',
    summary: 'Forget the authenticated user',
  })
  @ApiNoContentResponse({
    description: 'Authenticated user forgotten succesfully',
  })
  public async forgetAuthUser(@AuthUser() authUser: User): Promise<UserDto> {
    return this.mediator.send(new ForgetAuthUserCommand(authUser));
  }
}
