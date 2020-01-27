import {
  Controller,
  Get,
  HttpCode,
  Param,
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
import { AuthGuard, AuthUser } from 'auth';
import { UserEntity } from 'user';
import { NotificationDto } from 'notification/dto/notification.dto';
import { NotificationApplicationService } from 'notification/services/notification-application.service';

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
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'A list of notifications' })
  public async getNotificationsByAuthUser(
    @AuthUser() authUser: UserEntity,
  ): Promise<NotificationDto[]> {
    return this.notificationApplicationService.getNotificationsByAuthUser(
      authUser,
    );
  }

  /**
   * Read a notification
   */
  @Post(':id/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    description: 'Notification is successfully marked as read',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({
    status: 401,
    description: 'Notification does not belong to authenticated user',
  })
  public async readNotification(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<void> {
    await this.notificationApplicationService.markRead(authUser, id);
  }
}
