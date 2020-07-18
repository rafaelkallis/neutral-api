import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { ValidateNested, IsString } from 'class-validator';
import { ReviewTopicInputDto } from './ReviewTopicInputDto';
import { Type } from 'class-transformer';

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
  @Type(() => ReviewTopicInputDto)
  @ApiProperty({
    type: ReviewTopicInputDto,
  })
  public input: ReviewTopicInputDto;

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
