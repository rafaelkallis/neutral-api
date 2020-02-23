import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a role title is invalid.
 */
export class InvalidRoleTitleException extends BadRequestException {
  public constructor() {
    super('Invalid role title', 'invalid_role_title');
  }
}
