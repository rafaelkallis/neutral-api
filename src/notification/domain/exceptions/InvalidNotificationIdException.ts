import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a notification id is invalid.
 */
export class InvalidNotificationIdException extends BadRequestException {
  public constructor() {
    super('Invalid notification id', 'invalid_notification_id');
  }
}
