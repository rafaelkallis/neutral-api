import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ReviewTopicInputDto,
  ContinuousReviewTopicInputDto,
  DiscreteReviewTopicInputDto,
} from './ReviewTopicInputDto';

@ApiExtraModels(ContinuousReviewTopicInputDto, DiscreteReviewTopicInputDto)
export class ReviewTopicDto extends ModelDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Title of the review topic',
    example: 'Contribution',
  })
  public title: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: 'Description of the review topic',
    example: 'Impact towards completing the project objective',
  })
  public description: string;

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
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(ContinuousReviewTopicInputDto) },
      { $ref: getSchemaPath(DiscreteReviewTopicInputDto) },
    ],
  })
  public readonly input: ReviewTopicInputDto;

  @ApiProperty({ type: Number, example: 0.6, required: false })
  public consensuality: number | null;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    input: ReviewTopicInputDto,
    consensuality: number | null,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.input = input;
    this.consensuality = consensuality;
  }
}
