import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if user state is invalid.
 */
export class InvalidUserStateException extends BadRequestException {
  public constructor() {
    super('Invalid user state', 'invalid_user_state');
  }
}
