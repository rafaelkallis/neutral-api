import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a requested project state change is forbidden.
 */
export class ForbiddenProjectStateChangeException extends BadRequestException {
  public constructor() {
    super('Forbidden project state change', 'forbidden_project_state_change');
  }
}
