import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an id is invalid.
 */
export class InvalidIdException extends BadRequestException {
  public constructor() {
    super('Invalid id', 'invalid_id');
  }
}
