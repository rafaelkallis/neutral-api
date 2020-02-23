import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user name is invalid.
 */
export class InvalidNameException extends BadRequestException {
  public constructor() {
    super('Invalid name', 'invalid_name');
  }
}
