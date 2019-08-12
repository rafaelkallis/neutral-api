import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a token has already been used in the past.
 */
export class TokenAlreadyUsedException extends BadRequestException {
  public constructor() {
    super('Token has already been used', 'token_already_used');
  }
}
