import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested user was not found.
 */
export class UserNotFoundException extends NotFoundException {
  public constructor() {
    super('User was not found', 'user_not_found');
  }
}
