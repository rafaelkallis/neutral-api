import { BadRequestException } from '@nestjs/common';

export class TokenAlreadyUsedException extends BadRequestException {
  constructor() {
    super('Token has already been used', 'token_already_used');
  }
}
