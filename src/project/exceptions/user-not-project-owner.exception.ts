import { ForbiddenException } from '@nestjs/common';

/**
 * Exception thrown if the user is not the project owner.
 */
export class UserNotProjectOwnerException extends ForbiddenException {
  public constructor() {
    super('User is not the project owner', 'not_project_owner');
  }
}
