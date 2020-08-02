import { NotFoundException } from '@nestjs/common';

export class OrganizationNotFound extends NotFoundException {
  public constructor() {
    super('organization_not_found', 'Organization not found');
  }
}
