import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a string is invalid.
 */
export class InvalidStringException extends BadRequestException {
  public constructor() {
    super('Invalid string', 'invalid_string');
  }
}
