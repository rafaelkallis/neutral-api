import { BadRequestException } from '@nestjs/common';

export class EmailAlreadyChangedException extends BadRequestException {
  constructor() {
    super('Email has already been changed', 'email_already_changed');
  }
}
