import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown if a token claim is missing.
 */
export class TokenClaimMissingException extends UnauthorizedException {
  public constructor() {
    super('Token claim is missing', 'token_claim_missing');
  }
}
