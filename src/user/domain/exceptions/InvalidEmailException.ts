import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an email is invalid.
 */
export class InvalidEmailException extends BadRequestException {
  public constructor() {
    super('Invalid email', 'invalid_email');
  }
}
