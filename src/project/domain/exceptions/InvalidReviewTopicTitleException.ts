import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a review-topic title is invalid.
 */
export class InvalidReviewTopicTitleException extends BadRequestException {
  public constructor() {
    super('Invalid review-topic title', 'invalid_review_topic_title');
  }
}
