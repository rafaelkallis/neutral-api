import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if the notification type is invalid.
 */
export class InvalidNotificationTypeException extends BadRequestException {
  public constructor() {
    super('Invalid notification type', 'invalid_notification_type');
  }
}
