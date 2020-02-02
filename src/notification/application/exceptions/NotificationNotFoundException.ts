import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested notification was not found.
 */
export class NotificationNotFoundException extends NotFoundException {
  public constructor() {
    super('Notification was not found', 'notification_not_found');
  }
}
