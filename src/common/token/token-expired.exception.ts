import { BadRequestException } from '@nestjs/common';

export class TokenExpiredException extends BadRequestException {
  constructor() {
    super('Token is expired', 'token_expired');
  }
}
