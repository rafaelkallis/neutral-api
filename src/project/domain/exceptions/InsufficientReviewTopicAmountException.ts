import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if the amount of review topics is insufficient.
 */
export class InsufficientReviewTopicAmountException extends BadRequestException {
  public constructor() {
    super(
      'The number of review topics is insufficient, at least 1 is needed',
      'insufficient_review_topic_amount',
    );
  }
}
