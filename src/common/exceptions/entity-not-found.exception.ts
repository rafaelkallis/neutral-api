import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested entity was not found.
 */
export class EntityNotFoundException extends NotFoundException {
  public constructor() {
    super('Entity was not found', 'entity_not_found');
  }
}
