import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested object was not found.
 */
export class ObjectNotFoundException extends NotFoundException {
  public constructor() {
    super('Object was not found', 'object_not_found');
  }
}
