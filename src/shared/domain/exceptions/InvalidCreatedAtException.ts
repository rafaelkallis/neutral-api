import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a createdAt is invalid.
 */
export class InvalidCreatedAtException extends BadRequestException {
  public constructor() {
    super('Invalid createdAt', 'invalid_created_at');
  }
}
