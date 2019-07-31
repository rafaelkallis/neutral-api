import { BadRequestException } from '@nestjs/common';

export class EmailAlreadyUsedException extends BadRequestException {
  constructor() {
    super('Email is already being user', 'email_already_used');
  }
}
