import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a updatedAt is invalid.
 */
export class InvalidUpdatedAtException extends BadRequestException {
  public constructor() {
    super('Invalid updatedAt', 'invalid_updated_at');
  }
}
