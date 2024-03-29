import { ForbiddenException } from '@nestjs/common';

/**
 * Exception thrown if the authenticated user has insufficient permissions.
 */
export class InsufficientPermissionsException extends ForbiddenException {
  public constructor() {
    super(
      'Authenticated user has insufficient permissions',
      'insufficient_permissions',
    );
  }
}
