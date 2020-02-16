import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project title is invalid.
 */
export class InvalidProjectTitleException extends BadRequestException {
  public constructor() {
    super('Invalid project title', 'invalid_project_title');
  }
}
