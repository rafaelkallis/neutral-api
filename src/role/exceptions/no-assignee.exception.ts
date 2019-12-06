import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if no assignee was specified.
 */
export class NoAssigneeException extends BadRequestException {
  public constructor() {
    super('no assignee was specified', 'no_assignee');
  }
}
