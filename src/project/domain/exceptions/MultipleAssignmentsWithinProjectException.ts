import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user is assigned to multiple roles within a project.
 */
export class MultipleAssignmentsWithinProjectException extends BadRequestException {
  public constructor() {
    super(
      'multiple assignments within the same project are not allowed.',
      'multiple_assignments_within_project',
    );
  }
}
