import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a validation fails.
 */
export class ValidationException extends BadRequestException {
  constructor(message: string) {
    super(message, 'validation');
  }
}
