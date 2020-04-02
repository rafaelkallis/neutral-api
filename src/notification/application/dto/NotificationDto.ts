import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'shared/application/dto/BaseDto';
import { Notification } from 'notification/domain/Notification';
import { NotificationTypeValue } from 'notification/domain/value-objects/NotificationType';

/**
 * Notification DTO
 */
export class NotificationDto extends BaseDto {
  @ApiProperty({
    enum: NotificationTypeValue,
    example: NotificationTypeValue.NEW_ASSIGNMENT,
  })
  public type: NotificationTypeValue;

  @ApiProperty()
  public isRead: boolean;

  @ApiProperty({ type: Object, example: { foo: 123, bar: 'baz' } })
  public payload: object;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    type: NotificationTypeValue,
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
