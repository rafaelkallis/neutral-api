import {
  IsString,
  Min,
  ArrayMaxSize,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ReviewTopicInput,
  ContinuousReviewTopicInput,
  DiscreteReviewTopicInput,
} from 'project/domain/review-topic/ReviewTopicInput';
import { ValidationException } from 'shared/application/exceptions/ValidationException';

export enum ReviewTopicInputType {
  CONTINUOUS = 'continuous',
  DISCRETE = 'discrete',
}

export class ReviewTopicInputDto {
  @IsEnum(ReviewTopicInputType)
  @ApiProperty({
    type: String,
    enum: ReviewTopicInputType,
    description: 'Review topic input discriminator',
    example: 'discrete',
  })
  public readonly type: ReviewTopicInputType;

  // continuous input fields

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    type: Number,
    required: false,
    description: 'lower bound of the continuous review topic input',
    example: 0,
  })
  public readonly min?: number;

  @IsInt()
  @IsOptional()
  @ApiProperty({
    type: Number,
    required: false,
    description: 'upper bound of the continuous review topic input',
    example: 10,
  })
  public readonly max?: number;

  // discrete input fields

  @ArrayMaxSize(10)
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    required: false,
    description: 'lower bound of the continuous review topic input',
    example: ['bad', 'average', 'good'],
  })
  public readonly labels?: string[];

  @ArrayMaxSize(10)
  @IsOptional()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @ApiProperty({
    type: [Number],
    required: false,
    description: 'upper bound of the continuous review topic input',
    example: [2, 5, 8],
  })
  public readonly values?: number[];

  public asReviewTopicInput(): ReviewTopicInput {
    if (this.type === ReviewTopicInputType.CONTINUOUS) {
      if (typeof this.min !== 'number') {
        throw new ValidationException('invalid review topic input');
      }
      if (typeof this.max !== 'number') {
        throw new ValidationException('invalid review topic input');
      }
      return ContinuousReviewTopicInput.of(this.min, this.max);
    }
    if (this.type === ReviewTopicInputType.DISCRETE) {
      if (!this.values) {
        throw new ValidationException('invalid review topic input');
      }
      if (!this.labels) {
        throw new ValidationException('invalid review topic input');
      }
      return DiscreteReviewTopicInput.of(this.labels, this.values);
    }
    throw new ValidationException('invalid review topic input');
  }

  public constructor(
    type: ReviewTopicInputType,
    min?: number,
    max?: number,
    labels?: string[],
    values?: number[],
  ) {
    this.type = type;
    this.min = min;
    this.max = max;
    this.labels = labels;
    this.values = values;
  }
}
