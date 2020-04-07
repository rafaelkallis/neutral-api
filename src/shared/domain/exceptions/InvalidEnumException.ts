import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an enum is invalid.
 */
export class InvalidEnumException extends BadRequestException {
  public constructor() {
    super('Invalid enum', 'invalid_enum');
  }
}
