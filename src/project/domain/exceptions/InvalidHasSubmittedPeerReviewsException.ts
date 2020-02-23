import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if hasSubmittedPeerReviews is invalid.
 */
export class InvalidHasSubmittedPeerReviewsException extends BadRequestException {
  public constructor() {
    super(
      'Invalid hasSubmittedPeerReviews',
      'invalid_has_submitted_peer_reviews',
    );
  }
}
