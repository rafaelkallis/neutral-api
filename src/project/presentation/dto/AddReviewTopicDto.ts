import { PickType } from '@nestjs/swagger';
import {
  ReviewTopicInputDto,
  ReviewTopicInputType,
} from 'project/application/dto/ReviewTopicInputDto';
import { ReviewTopicDto } from 'project/application/dto/ReviewTopicDto';

export class AddReviewTopicDto extends PickType(ReviewTopicDto, [
  'title',
  'description',
  'input',
] as const) {
  public constructor(
    title: string,
    description: string,
    // TODO remove default value once frontend catches up
    input: ReviewTopicInputDto = new ReviewTopicInputDto(
      ReviewTopicInputType.CONTINUOUS,
      0,
      100,
      undefined,
      undefined,
    ),
  ) {
    super();
    this.title = title;
    this.description = description;
    this.input = input;
  }
}
