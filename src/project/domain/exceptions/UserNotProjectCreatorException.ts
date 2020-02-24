import { ForbiddenException } from '@nestjs/common';

/**
 * Exception thrown if the user is not the project creator.
 */
export class UserNotProjectCreatorException extends ForbiddenException {
  public constructor() {
    super('User is not the project creator', 'not_project_creator');
  }
}
