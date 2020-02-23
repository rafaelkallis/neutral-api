import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if project state is invalid.
 */
export class InvalidProjectStateException extends BadRequestException {
  public constructor() {
    super('Invalid project state', 'invalid_project_state');
  }
}
