import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { ValidateNested, IsString, IsEnum, IsOptional } from 'class-validator';
import { ReviewTopicInputDto } from './ReviewTopicInputDto';
import { Type } from 'class-transformer';
import {
  ReviewSubjectTypeLabel,
  ReviewSubjectType,
} from 'project/domain/review-topic/value-objects/ReviewSubjectType';
import { ExtrinsicReviewSubjectDto } from 'project/application/dto/ExtrinsicReviewSubjectDto';

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

  @IsEnum(ReviewSubjectTypeLabel)
  @ApiProperty({
    type: String,
    enum: ReviewSubjectTypeLabel,
    description: 'Review subject type',
    example: ReviewSubjectTypeLabel.EXTRINSIC,
  })
  public subjectType: ReviewSubjectTypeLabel;

  @IsOptional()
  @ApiProperty({
    type: [ExtrinsicReviewSubjectDto],
    description: 'Review subjects',
  })
  @ValidateNested({ each: true })
  @Type(() => ExtrinsicReviewSubjectDto)
  public extrinsicSubjects?: ExtrinsicReviewSubjectDto[];

  @ApiProperty({ type: Number, example: 0.6, required: false })
  public consensuality: number | null;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    input: ReviewTopicInputDto,
    subjectType: ReviewSubjectTypeLabel,
    extrinsicSubjects: ExtrinsicReviewSubjectDto[] | undefined,
    consensuality: number | null,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.input = input;
    this.subjectType = subjectType;
    this.extrinsicSubjects = extrinsicSubjects;
    this.consensuality = consensuality;
  }

  public toReviewSubjectType(): ReviewSubjectType {
    return ReviewSubjectType.of(
      this.subjectType,
      this.extrinsicSubjects?.map((dto) => dto.toExtrinsicReviewSubject()),
    );
  }
}
