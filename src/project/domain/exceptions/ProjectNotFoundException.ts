import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested project was not found.
 */
export class ProjectNotFoundException extends NotFoundException {
  public constructor() {
    super('Project was not found', 'project_not_found');
  }
}
