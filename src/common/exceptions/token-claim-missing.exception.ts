import { UnauthorizedException } from '@nestjs/common';

export class TokenClaimMissingException extends UnauthorizedException {
  constructor() {
    super('Token claim is missing', 'token_claim_missing');
  }
}
