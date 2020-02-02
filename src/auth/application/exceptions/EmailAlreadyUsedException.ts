import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an email address is already used.
 */
export class EmailAlreadyUsedException extends BadRequestException {
  public constructor() {
    super('Email has already been used', 'email_already_used');
  }
}
