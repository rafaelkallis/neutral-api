import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/application/dto/BaseDto';
import { NotificationModel } from 'notification/domain/NotificationModel';

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
      notificationModel.id.value,
      notificationModel.createdAt.value,
      notificationModel.updatedAt.value,
      notificationModel.type.toValue(),
      notificationModel.isRead.value,
      notificationModel.payload,
    );
  }
}
