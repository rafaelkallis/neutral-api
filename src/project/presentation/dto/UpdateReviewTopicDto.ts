import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ReviewTopicInputDto,
  ContinuousReviewTopicInputDto,
  DiscreteReviewTopicInputDto,
} from 'project/application/dto/ReviewTopicInputDto';

export class UpdateReviewTopicDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Punctuality',
    description: 'Title of the review topic',
    required: false,
  })
  public title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example:
      'Completing a required task or fulfilling an obligation before or at a previously designated time.',
    description: 'Description of the review topic',
    required: false,
  })
  public description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReviewTopicInputDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'continuous', value: ContinuousReviewTopicInputDto },
        { name: 'discrete', value: DiscreteReviewTopicInputDto },
      ],
    },
  })
  @ApiProperty()
  public readonly input?: ReviewTopicInputDto;

  public constructor(
    title?: string,
    description?: string,
    input?: ReviewTopicInputDto,
  ) {
    this.title = title;
    this.description = description;
    this.input = input;
  }
}
