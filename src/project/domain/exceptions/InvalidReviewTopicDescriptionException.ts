import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a review-topic description is invalid.
 */
export class InvalidReviewTopicDescriptionException extends BadRequestException {
  public constructor() {
    super(
      'Invalid review-topic description',
      'invalid_review_topic_description',
    );
  }
}
