import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user is assigned to multiple roles within a project.
 */
export class SingleAssignmentPerUserViolationException extends BadRequestException {
  public constructor() {
    super(
      'a user can only have a single assignment within a project',
      'single_assignement_per_user_violation',
    );
  }
}
