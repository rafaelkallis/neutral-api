import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a boolean is invalid.
 */
export class InvalidBooleanException extends BadRequestException {
  public constructor() {
    super('Invalid boolean', 'invalid_boolean');
  }
}
