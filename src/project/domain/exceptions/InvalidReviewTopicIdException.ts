import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a review-topic id is invalid.
 */
export class InvalidReviewTopicIdException extends BadRequestException {
  public constructor() {
    super('Invalid review-topic id', 'invalid_review_topic_id');
  }
}
