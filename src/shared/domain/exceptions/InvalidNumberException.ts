import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a number is invalid.
 */
export class InvalidNumberException extends BadRequestException {
  public constructor() {
    super('Invalid number', 'invalid_number');
  }
}
