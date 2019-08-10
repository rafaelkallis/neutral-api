import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown if the given token is expired.
 */
export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super('Token is expired', 'token_expired');
  }
}
