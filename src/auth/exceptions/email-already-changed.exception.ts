import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an email address has already been changed.
 */
export class EmailAlreadyChangedException extends BadRequestException {
  constructor() {
    super('Email has already been changed', 'email_already_changed');
  }
}
