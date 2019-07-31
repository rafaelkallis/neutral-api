import { BadRequestException } from '@nestjs/common';

export class TokenClaimMissingException extends BadRequestException {
  constructor() {
    super('Token claim is missing', 'token_claim_missing');
  }
}
