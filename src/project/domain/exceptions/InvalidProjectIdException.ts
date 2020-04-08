import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a project id is invalid.
 */
export class InvalidProjectIdException extends BadRequestException {
  public constructor() {
    super('Invalid project id', 'invalid_project_id');
  }
}
