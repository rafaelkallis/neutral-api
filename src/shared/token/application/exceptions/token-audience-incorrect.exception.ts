import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown if the token audience is incorrect.
 */
export class TokenAudienceIncorrectException extends UnauthorizedException {
  public constructor() {
    super('Token audience is incorrect', 'token_audience_incorrect');
  }
}
