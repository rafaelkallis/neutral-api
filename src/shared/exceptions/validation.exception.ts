import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a validation fails.
 */
export class ValidationException extends BadRequestException {
  public constructor(message: string) {
    super(message, 'validation');
  }
}
