import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user submits a peer review for a role that does not exist.
 */
export class PeerReviewRoleMismatchException extends BadRequestException {
  public constructor() {
    super('Peer review role mismatch', 'peer_review_role_mismatch');
  }
}
