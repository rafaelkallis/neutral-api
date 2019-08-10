import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown if the given token was issued in the future.
 */
export class TokenFromFutureException extends UnauthorizedException {
  constructor() {
    super('Token is from the future', 'token_from_future');
  }
}
