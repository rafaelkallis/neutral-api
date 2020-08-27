import { PickType } from '@nestjs/swagger';
import {
  ReviewTopicInputDto,
  ReviewTopicInputType,
} from 'project/application/dto/ReviewTopicInputDto';
import { ReviewTopicDto } from 'project/application/dto/ReviewTopicDto';
import {
  ReviewSubjectTypeLabel,
  ReviewSubjectType,
} from 'project/domain/review-topic/value-objects/ReviewSubjectType';

export class AddReviewTopicDto extends PickType(ReviewTopicDto, [
  'title',
  'description',
  'input',
  'subjectType',
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
    subjectType: ReviewSubjectTypeLabel,
  ) {
    super();
    this.title = title;
    this.description = description;
    this.input = input;
    this.subjectType = subjectType;
  }

  public toReviewSubjectType(): ReviewSubjectType {
    return ReviewSubjectType.of(this.subjectType, []);
  }
}
