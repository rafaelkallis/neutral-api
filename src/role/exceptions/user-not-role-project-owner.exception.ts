import { ForbiddenException } from '@nestjs/common';

/**
 * Exception thrown if user is not the owner of the roles's project.
 */
export class UserNotRoleProjectOwnerException extends ForbiddenException {
  public constructor() {
    super(
      "User is not owner of the role's project",
      'user_not_role_project_owner',
    );
  }
}
