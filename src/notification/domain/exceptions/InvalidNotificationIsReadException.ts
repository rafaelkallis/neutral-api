import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if the isRead is invalid.
 */
export class InvalidNotificationIsReadException extends BadRequestException {
  public constructor() {
    super('Invalid isRead', 'invalid_is_read');
  }
}
