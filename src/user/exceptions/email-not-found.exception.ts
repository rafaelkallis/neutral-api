import { NotFoundException } from '@nestjs/common';

export class EmailNotFoundException extends NotFoundException {
  constructor() {
    super('User with given email was not found', 'email_not_found');
  }
}
