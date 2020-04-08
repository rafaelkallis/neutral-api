import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user id is invalid.
 */
export class InvalidUserIdException extends BadRequestException {
  public constructor() {
    super('Invalid user id', 'invalid_user_id');
  }
}
