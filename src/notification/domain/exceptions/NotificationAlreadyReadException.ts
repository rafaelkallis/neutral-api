import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an already read notification is to be marked read.
 */
export class NotificationAlreadyReadException extends BadRequestException {
  public constructor() {
    super('Notification already read', 'notification_already_read');
  }
}
