import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a contribution is invalid.
 */
export class InvalidContributionException extends BadRequestException {
  public constructor() {
    super('Invalid contribution', 'invalid_contribution');
  }
}
