import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project is not in peer-review state.
 */
export class ProjectNotPeerReviewStateException extends BadRequestException {
  public constructor() {
    super(
      'Project is not in peer-review state',
      'project_not_peer_review_state',
    );
  }
}
