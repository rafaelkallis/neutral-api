import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { User } from 'user/domain/User';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';

/**
 * Notification Controller
 */
@Controller('notifications')
@ApiTags('Notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationController {
  private readonly notificationApplicationService: NotificationApplicationService;

  public constructor(
    notificationApplicationService: NotificationApplicationService,
  ) {
    this.notificationApplicationService = notificationApplicationService;
  }

  /**
   * Get Notification
   */
  @Get()
  @ApiOperation({
    operationId: 'getAuthUserNotifications',
    summary: 'Get all notifications of the authenticated user',
  })
  @ApiOkResponse({
    description: 'A list of notifications',
    type: [NotificationDto],
  })
  public async getAuthUserNotifications(
    @AuthUser() authUser: User,
  ): Promise<NotificationDto[]> {
    return this.notificationApplicationService.getNotificationsByAuthUser(
      authUser,
    );
  }

  /**
   * Read a notification
   */
  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'readNotification',
    summary: 'Mark a notification as read',
  })
  @ApiOkResponse({ description: 'Notification is successfully marked as read' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  @ApiForbiddenResponse({
    description: 'Notification does not belong to authenticated user',
  })
  public async readNotification(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<NotificationDto> {
    return this.notificationApplicationService.markRead(authUser, id);
  }
}
