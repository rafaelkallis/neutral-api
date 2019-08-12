import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown if the given token is expired.
 */
export class TokenExpiredException extends UnauthorizedException {
  public constructor() {
    super('Token is expired', 'token_expired');
  }
}
