import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if peer review score is invalid.
 */
export class InvalidPeerReviewScoreException extends BadRequestException {
  public constructor() {
    super('Invalid peer review score', 'invalid_peer_review_score');
  }
}
