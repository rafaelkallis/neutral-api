import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an invalid project type query is used.
 */
export class InvalidProjectTypeQueryException extends BadRequestException {
  public constructor() {
    super('Invalid project type query', 'invalid_project_type_query');
  }
}
