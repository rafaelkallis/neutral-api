import { UnauthorizedException } from '@nestjs/common';

export class TokenMalformedException extends UnauthorizedException {
  constructor() {
    super('Token is malformed', 'token_malformed');
  }
}
