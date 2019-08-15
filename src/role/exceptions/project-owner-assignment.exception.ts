import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project owner assigns himself to a role.
 */
export class ProjectOwnerAssignmentException extends BadRequestException {
  public constructor() {
    super('Cannot assign project owner to role', 'project_owner_assignment');
  }
}
