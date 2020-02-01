import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/dto/base.dto';
import { NotificationModel } from 'notification/notification.model';

/**
 * Notification DTO
 */
export class NotificationDto extends BaseDto {
  @ApiProperty()
  public type: string;

  @ApiProperty()
  public isRead: boolean;

  @ApiProperty()
  public payload: object;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    type: string,
    isRead: boolean,
    payload: object,
  ) {
    super(id, createdAt, updatedAt);
    this.type = type;
    this.isRead = isRead;
    this.payload = payload;
  }

  public static fromModel(
    notificationModel: NotificationModel,
  ): NotificationDto {
    return new NotificationDto(
      notificationModel.id,
      notificationModel.createdAt,
      notificationModel.updatedAt,
      notificationModel.type,
      notificationModel.isRead,
      notificationModel.payload,
    );
  }
}
