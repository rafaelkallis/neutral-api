import { NotFoundException } from '@nestjs/common';

/**
 * Error thrown if the requested peer review was not found.
 */
export class PeerReviewNotFoundException extends NotFoundException {
  public constructor() {
    super('Peer review was not found', 'peer_review_not_found');
  }
}
