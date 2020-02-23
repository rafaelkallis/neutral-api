import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/application/dto/BaseDto';
import { Notification } from 'notification/domain/Notification';

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

  public static fromModel(notificationModel: Notification): NotificationDto {
    return new NotificationDto(
      notificationModel.id.value,
      notificationModel.createdAt.value,
      notificationModel.updatedAt.value,
      notificationModel.type.value,
      notificationModel.isRead.value,
      notificationModel.payload,
    );
  }
}
