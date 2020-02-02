import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if owner is attempting to assign himself to a role from his project.
 */
export class ProjectOwnerRoleAssignmentException extends BadRequestException {
  public constructor() {
    super(
      'Project owner cannot assign himself to a role of his project',
      'project_owner_role_assignment',
    );
  }
}
