import { PartialType, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ReviewTopicInputDto } from 'project/application/dto/ReviewTopicInputDto';
import { ReviewTopicDto } from 'project/application/dto/ReviewTopicDto';

export class UpdateReviewTopicDto extends PartialType(
  PickType(ReviewTopicDto, ['title', 'description', 'input'] as const),
) {
  @IsOptional()
  public title?: string;

  @IsOptional()
  public description?: string;

  @IsOptional()
  public readonly input?: ReviewTopicInputDto;

  public constructor(
    title?: string,
    description?: string,
    input?: ReviewTopicInputDto,
  ) {
    super();
    this.title = title;
    this.description = description;
    this.input = input;
  }
}
