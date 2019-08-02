import { UnauthorizedException } from '@nestjs/common';

export class TokenFromFutureException extends UnauthorizedException {
  constructor() {
    super('Token is from the future', 'token_from_future');
  }
}
