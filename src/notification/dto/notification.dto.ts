import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/dto/base.dto';
import { NotificationEntity } from 'notification/entities/notification.entity';

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

  public static fromEntity(
    notificationEntity: NotificationEntity,
  ): NotificationDto {
    return new NotificationDto(
      notificationEntity.id,
      notificationEntity.createdAt,
      notificationEntity.updatedAt,
      notificationEntity.type,
      notificationEntity.isRead,
      notificationEntity.payload,
    );
  }
}
