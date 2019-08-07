import { NotFoundException } from '@nestjs/common';

export class EntityNotFoundException extends NotFoundException {
  constructor() {
    super('Entity was not found', 'entity_not_found');
  }
}
