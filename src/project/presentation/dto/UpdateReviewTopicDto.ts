import { PartialType, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ReviewTopicInputDto } from 'project/application/dto/ReviewTopicInputDto';
import { ReviewTopicDto } from 'project/application/dto/ReviewTopicDto';
import { ReviewSubjectTypeLabel } from 'project/domain/review-topic/value-objects/ReviewSubjectType';
import { ExtrinsicReviewSubjectDto } from 'project/application/dto/ExtrinsicReviewSubjectDto';

export class UpdateReviewTopicDto extends PartialType(
  PickType(ReviewTopicDto, [
    'title',
    'description',
    'input',
    'subjectType',
    'extrinsicSubjects',
  ] as const),
) {
  @IsOptional()
  public title?: string;

  @IsOptional()
  public description?: string;

  @IsOptional()
  public input?: ReviewTopicInputDto;

  @IsOptional()
  public subjectType?: ReviewSubjectTypeLabel;

  @IsOptional()
  public extrinsicSubjects?: ExtrinsicReviewSubjectDto[];

  public constructor(
    title?: string,
    description?: string,
    input?: ReviewTopicInputDto,
    subjectType?: ReviewSubjectTypeLabel,
    extrinsicSubjects?: ExtrinsicReviewSubjectDto[],
  ) {
    super();
    this.title = title;
    this.description = description;
    this.input = input;
    this.subjectType = subjectType;
    this.extrinsicSubjects = extrinsicSubjects;
  }
}
