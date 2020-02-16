import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a user submits a self review during peer review.
 */
export class SelfPeerReviewException extends BadRequestException {
  public constructor() {
    super('Self review during peer review', 'self_peer_review');
  }
}
