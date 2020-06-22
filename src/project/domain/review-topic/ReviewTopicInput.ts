import { ValidationException } from 'shared/application/exceptions/ValidationException';

export abstract class ReviewTopicInput {
  public abstract fold<T>(visitor: ReviewTopicInputVisitor<T>): T;
}

export class ContinuousReviewTopicInput extends ReviewTopicInput {
  public readonly min: number;
  public readonly max: number;

  public static of(min: number, max: number): ContinuousReviewTopicInput {
    if (min < 0) {
      throw new ValidationException('min has to be >= 0');
    }
    if (min >= max) {
      throw new ValidationException('max has to be strictly greater than min');
    }
    return new ContinuousReviewTopicInput(min, max);
  }

  public fold<T>(visitor: ReviewTopicInputVisitor<T>): T {
    return visitor.continuous(this);
  }

  private constructor(min: number, max: number) {
    super();
    this.min = min;
    this.max = max;
  }
}

export class DiscreteReviewTopicInput extends ReviewTopicInput {
  public readonly labels: string[];
  public readonly values: number[];

  public static of(
    labels: string[],
    values: number[],
  ): DiscreteReviewTopicInput {
    if (labels.length !== values.length) {
      throw new ValidationException('number of labels and values do not match');
    }
    return new DiscreteReviewTopicInput(labels, values);
  }

  public fold<T>(visitor: ReviewTopicInputVisitor<T>): T {
    return visitor.discrete(this);
  }

  private constructor(labels: string[], values: number[]) {
    super();
    this.labels = labels;
    this.values = values;
  }
}

export interface ReviewTopicInputVisitor<T> {
  continuous(reviewTopicInput: ContinuousReviewTopicInput): T;
  discrete(reviewTopicInput: DiscreteReviewTopicInput): T;
}
