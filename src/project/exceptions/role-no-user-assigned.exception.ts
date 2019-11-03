import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project role has no user assigned.
 */
export class RoleNoUserAssignedException extends BadRequestException {
  public constructor() {
    super("A project's role has no user assigned", 'role_no_user_assigned');
  }
}
