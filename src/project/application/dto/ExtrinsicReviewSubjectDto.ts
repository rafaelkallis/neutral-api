import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { ExtrinsicReviewSubject } from 'project/domain/extrinsic-review-subject/ExtrinsicReviewSubject';
import { ExtrinsicReviewSubjectId } from 'project/domain/extrinsic-review-subject/value-objects/ExtrinsicReviewSubjectId';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ExtrinsicReviewSubjectTitle } from 'project/domain/extrinsic-review-subject/value-objects/ExtrinsicReviewSubjectTitle';
import { ExtrinsicReviewSubjectDescription } from 'project/domain/extrinsic-review-subject/value-objects/ExtrinsicReviewSubjectDescription';

export class ExtrinsicReviewSubjectDto extends ModelDto {
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Apples',
    description: 'Title of the review subject',
  })
  public title: string;

  @IsString()
  @ApiProperty({
    type: String,
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the review subject',
  })
  public description: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
  }

  public static ofExtrinsicReviewSubject(
    extrinsicReviewSubject: ExtrinsicReviewSubject,
  ): ExtrinsicReviewSubjectDto {
    return new ExtrinsicReviewSubjectDto(
      extrinsicReviewSubject.id.value,
      extrinsicReviewSubject.createdAt.value,
      extrinsicReviewSubject.updatedAt.value,
      extrinsicReviewSubject.title.value,
      extrinsicReviewSubject.description.value,
    );
  }

  public toExtrinsicReviewSubject(): ExtrinsicReviewSubject {
    return new ExtrinsicReviewSubject(
      ExtrinsicReviewSubjectId.of(this.id),
      CreatedAt.from(this.createdAt),
      UpdatedAt.from(this.updatedAt),
      ExtrinsicReviewSubjectTitle.of(this.title),
      ExtrinsicReviewSubjectDescription.of(this.description),
    );
  }
}
