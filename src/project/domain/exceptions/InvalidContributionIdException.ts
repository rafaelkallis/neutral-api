import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a contribution id is invalid.
 */
export class InvalidContributionIdException extends BadRequestException {
  public constructor() {
    super('Invalid contribution id', 'invalid_contribution_id');
  }
}
