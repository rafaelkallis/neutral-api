import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a timestamp is invalid.
 */
export class InvalidTimestampException extends BadRequestException {
  public constructor() {
    super('Invalid timestamp', 'invalid_timestamp');
  }
}
