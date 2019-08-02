import { BadRequestException } from '@nestjs/common';

export class EmailAlreadyUsedException extends BadRequestException {
  constructor() {
    super('Email has already been used', 'email_already_used');
  }
}
