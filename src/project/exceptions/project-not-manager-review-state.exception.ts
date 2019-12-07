import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project is not in manager-review state.
 */
export class ProjectNotManagerReviewStateException extends BadRequestException {
  public constructor() {
    super(
      'Project is not in manager-review state',
      'project_not_manager_review_state',
    );
  }
}
