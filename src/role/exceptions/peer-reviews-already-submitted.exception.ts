import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user peer reviews for a second time.
 */
export class PeerReviewsAlreadySubmittedException extends BadRequestException {
  public constructor() {
    super('Peer reviews already submitted', 'peer_reviews_already_submitted');
  }
}
