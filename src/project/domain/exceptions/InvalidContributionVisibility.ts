import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if contribution visibility is invalid.
 */
export class InvalidContributionVisibilityException extends BadRequestException {
  public constructor() {
    super('Invalid contribution visibility', 'invalid_contribution_visibility');
  }
}
