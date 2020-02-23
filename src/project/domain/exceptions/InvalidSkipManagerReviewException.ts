import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if skipManagerReview is invalid.
 */
export class InvalidSkipManagerReviewException extends BadRequestException {
  public constructor() {
    super('Invalid skip manager review', 'invalid_skip_manager_review');
  }
}
