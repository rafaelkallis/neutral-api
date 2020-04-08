import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a role id is invalid.
 */
export class InvalidRoleIdException extends BadRequestException {
  public constructor() {
    super('Invalid role id', 'invalid_role_id');
  }
}
