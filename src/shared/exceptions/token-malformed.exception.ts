import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown if the given token is malformed.
 */
export class TokenMalformedException extends UnauthorizedException {
  public constructor() {
    super('Token is malformed', 'token_malformed');
  }
}
