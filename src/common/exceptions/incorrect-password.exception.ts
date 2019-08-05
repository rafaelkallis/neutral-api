import { BadRequestException } from '@nestjs/common';

export class IncorrectPasswordException extends BadRequestException {
  constructor() {
    super('Password is incorrect', 'incorrect_password');
  }
}
