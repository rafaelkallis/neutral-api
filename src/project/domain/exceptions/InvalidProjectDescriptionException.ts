import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project description is invalid.
 */
export class InvalidProjectDescriptionException extends BadRequestException {
  public constructor() {
    super('Invalid project description', 'invalid_project_description');
  }
}
