import {
  IsNumber,
  IsString,
  Min,
  ArrayMaxSize,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ReviewTopicInput,
  ContinuousReviewTopicInput,
  DiscreteReviewTopicInput,
} from 'project/domain/review-topic/ReviewTopicInput';

export enum ReviewTopicInputType {
  CONTINUOUS = 'continuous',
  DISCRETE = 'discrete',
}

export abstract class ReviewTopicInputDto {
  @IsEnum(ReviewTopicInputType)
  public abstract readonly type: ReviewTopicInputType;

  public abstract asReviewTopicInput(): ReviewTopicInput;
}

export class ContinuousReviewTopicInputDto extends ReviewTopicInputDto {
  @ApiProperty({
    type: String,
    enum: [ReviewTopicInputType.CONTINUOUS],
    example: ReviewTopicInputType.CONTINUOUS,
  })
  public readonly type = ReviewTopicInputType.CONTINUOUS;

  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'lower bound of the continuous review topic input',
    example: 0,
  })
  public readonly min: number;

  @IsInt()
  @ApiProperty({
    description: 'upper bound of the continuous review topic input',
    example: 10,
  })
  public readonly max: number;

  public asReviewTopicInput(): ReviewTopicInput {
    return ContinuousReviewTopicInput.of(this.min, this.max);
  }

  public constructor(min: number, max: number) {
    super();
    this.min = min;
    this.max = max;
  }
}

export class DiscreteReviewTopicInputDto extends ReviewTopicInputDto {
  @ApiProperty({
    type: String,
    enum: [ReviewTopicInputType.DISCRETE],
    example: ReviewTopicInputType.DISCRETE,
  })
  public readonly type = ReviewTopicInputType.DISCRETE;

  @ArrayMaxSize(10)
  @IsString({ each: true })
  @ApiProperty({
    description: 'lower bound of the continuous review topic input',
    example: ['bad', 'average', 'good'],
  })
  public readonly labels: string[];

  @ArrayMaxSize(10)
  @IsNumber({}, { each: true })
  @ApiProperty({
    description: 'upper bound of the continuous review topic input',
    example: [2, 5, 8],
  })
  public readonly values: number[];

  public asReviewTopicInput(): ReviewTopicInput {
    return DiscreteReviewTopicInput.of(this.labels, this.values);
  }

  public constructor(labels: string[], values: number[]) {
    super();
    this.labels = labels;
    this.values = values;
  }
}
