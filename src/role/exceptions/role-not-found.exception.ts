import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested role was not found.
 */
export class RoleNotFoundException extends NotFoundException {
  public constructor() {
    super('Role was not found', 'role_not_found');
  }
}
