import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if user has already been assigned to another role in the same project.
 */
export class AlreadyAssignedRoleSameProjectException extends BadRequestException {
  public constructor() {
    super(
      'user has already been assigned to another role in the same project',
      'already_assigned_role_same_project',
    );
  }
}
