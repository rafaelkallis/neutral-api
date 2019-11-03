import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user submits invalid peer reviews.
 */
export class InvalidPeerReviewsException extends BadRequestException {
  public constructor() {
    super('Invalid peer reviews', 'invalid_peer_reviews');
  }
}
