import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a peer review id is invalid.
 */
export class InvalidPeerReviewIdException extends BadRequestException {
  public constructor() {
    super('Invalid peer review id', 'invalid_peer_review_id');
  }
}
