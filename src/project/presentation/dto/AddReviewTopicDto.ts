import { PickType } from '@nestjs/swagger';
import {
  ReviewTopicInputDto,
  ContinuousReviewTopicInputDto,
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
    input: ReviewTopicInputDto = new ContinuousReviewTopicInputDto(0, 100),
  ) {
    super();
    this.title = title;
    this.description = description;
    this.input = input;
  }
}
