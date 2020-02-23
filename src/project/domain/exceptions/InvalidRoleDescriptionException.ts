import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a role description is invalid.
 */
export class InvalidRoleDescriptionException extends BadRequestException {
  public constructor() {
    super('Invalid role description', 'invalid_role_description');
  }
}
