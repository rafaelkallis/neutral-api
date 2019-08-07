import { ForbiddenException } from '@nestjs/common';

export class NotResourceOwnerException extends ForbiddenException {
  constructor() {
    super('Authenticated user is not the resource owner', 'not_resource_owner');
  }
}
