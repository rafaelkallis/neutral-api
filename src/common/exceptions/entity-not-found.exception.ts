import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested entity was not found.
 */
export class EntityNotFoundException extends NotFoundException {
  constructor() {
    super('Entity was not found', 'entity_not_found');
  }
}
