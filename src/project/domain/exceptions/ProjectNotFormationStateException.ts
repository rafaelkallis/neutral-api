import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project is not in formation state.
 */
export class ProjectNotFormationStateException extends BadRequestException {
  public constructor() {
    super('Project is not in formation state', 'project_not_formation_state');
  }
}
